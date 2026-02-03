"""
Reports Endpoints - Sistema completo de relatórios
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, case, extract
from datetime import datetime, timedelta, date
from decimal import Decimal

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.models.user import User
from app.models.financial import FinancialTransaction, FinancialCategory
from app.models.commission import Commission, CommissionStatus
from app.models.command import Command, CommandStatus
from app.models.purchase import Purchase
from app.models.subscription_sale import SubscriptionSale, SubscriptionSaleStatus, SubscriptionSaleModel
from app.models.client import Client

router = APIRouter(
    redirect_slashes=False
)


# ========== RELATÓRIO DE DESPESAS ==========

@router.get("/expenses")
async def get_expenses_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    category_id: Optional[int] = None,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Relatório completo de despesas
    Similar ao do Belasis
    """
    # Total de despesas por categoria
    expenses_by_category = db.query(
        FinancialCategory.name.label('category'),
        func.sum(FinancialTransaction.value).label('total'),
        func.count(FinancialTransaction.id).label('count')
    ).join(
        FinancialTransaction,
        FinancialTransaction.category_id == FinancialCategory.id
    ).filter(
        FinancialTransaction.company_id == current_user.company_id,
        FinancialTransaction.type == "expense",
        FinancialTransaction.date >= start_date,
        FinancialTransaction.date <= end_date
    ).group_by(FinancialCategory.name).all()
    
    # Total de despesas por origem
    expenses_by_origin = db.query(
        FinancialTransaction.origin.label('origin'),
        func.sum(FinancialTransaction.value).label('total'),
        func.count(FinancialTransaction.id).label('count')
    ).filter(
        FinancialTransaction.company_id == current_user.company_id,
        FinancialTransaction.type == "expense",
        FinancialTransaction.date >= start_date,
        FinancialTransaction.date <= end_date
    ).group_by(FinancialTransaction.origin).all()
    
    # Total geral
    total_expenses = db.query(
        func.sum(FinancialTransaction.value)
    ).filter(
        FinancialTransaction.company_id == current_user.company_id,
        FinancialTransaction.type == "expense",
        FinancialTransaction.date >= start_date,
        FinancialTransaction.date <= end_date
    ).scalar() or 0
    
    # Despesas por mês (para gráfico)
    expenses_by_month = db.query(
        func.to_char(FinancialTransaction.date, 'YYYY-MM').label('month'),
        func.sum(FinancialTransaction.value).label('total')
    ).filter(
        FinancialTransaction.company_id == current_user.company_id,
        FinancialTransaction.type == "expense",
        FinancialTransaction.date >= start_date,
        FinancialTransaction.date <= end_date
    ).group_by(func.to_char(FinancialTransaction.date, 'YYYY-MM')).all()
    
    # Maiores despesas individuais
    top_expenses = db.query(
        FinancialTransaction
    ).filter(
        FinancialTransaction.company_id == current_user.company_id,
        FinancialTransaction.type == "expense",
        FinancialTransaction.date >= start_date,
        FinancialTransaction.date <= end_date
    ).order_by(FinancialTransaction.value.desc()).limit(10).all()
    
    return {
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        "total_expenses": float(total_expenses),
        "by_category": [
            {
                "category": item.category or "Sem categoria",
                "total": float(item.total or 0),
                "count": item.count,
                "percentage": (float(item.total or 0) / float(total_expenses) * 100) if total_expenses > 0 else 0
            }
            for item in expenses_by_category
        ],
        "by_origin": [
            {
                "origin": item.origin,
                "total": float(item.total or 0),
                "count": item.count,
                "percentage": (float(item.total or 0) / float(total_expenses) * 100) if total_expenses > 0 else 0
            }
            for item in expenses_by_origin
        ],
        "by_month": [
            {
                "month": item.month,
                "total": float(item.total or 0)
            }
            for item in expenses_by_month
        ],
        "top_expenses": [
            {
                "id": exp.id,
                "description": exp.description,
                "value": float(exp.value),
                "date": exp.date.isoformat(),
                "origin": exp.origin,
                "category": exp.category.name if exp.category else None
            }
            for exp in top_expenses
        ]
    }


# ========== RESULTADOS FINANCEIROS (DRE) ==========

@router.get("/financial-results")
async def get_financial_results(
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Relatório de Resultados Financeiros (DRE Simplificado)
    Similar ao do Belasis
    """
    # ========== RECEITAS ==========
    
    # Receitas por origem
    income_by_origin = db.query(
        FinancialTransaction.origin,
        func.sum(FinancialTransaction.value).label('total'),
        func.sum(FinancialTransaction.net_value).label('net_total'),
        func.count(FinancialTransaction.id).label('count')
    ).filter(
        FinancialTransaction.company_id == current_user.company_id,
        FinancialTransaction.type == "income",
        FinancialTransaction.date >= start_date,
        FinancialTransaction.date <= end_date
    ).group_by(FinancialTransaction.origin).all()
    
    total_income_gross = sum(float(item.total or 0) for item in income_by_origin)
    total_income_net = sum(float(item.net_total or 0) for item in income_by_origin)
    total_fees = total_income_gross - total_income_net
    
    # ========== DESPESAS ==========
    
    # Comissões
    total_commissions = db.query(
        func.sum(FinancialTransaction.value)
    ).filter(
        FinancialTransaction.company_id == current_user.company_id,
        FinancialTransaction.origin == "commission",
        FinancialTransaction.date >= start_date,
        FinancialTransaction.date <= end_date
    ).scalar() or 0
    
    # Compras
    total_purchases = db.query(
        func.sum(FinancialTransaction.value)
    ).filter(
        FinancialTransaction.company_id == current_user.company_id,
        FinancialTransaction.origin == "purchase",
        FinancialTransaction.date >= start_date,
        FinancialTransaction.date <= end_date
    ).scalar() or 0
    
    # Outras despesas
    other_expenses = db.query(
        func.sum(FinancialTransaction.value)
    ).filter(
        FinancialTransaction.company_id == current_user.company_id,
        FinancialTransaction.type == "expense",
        FinancialTransaction.origin.notin_(["commission", "purchase"]),
        FinancialTransaction.date >= start_date,
        FinancialTransaction.date <= end_date
    ).scalar() or 0
    
    total_expenses = float(total_commissions or 0) + float(total_purchases or 0) + float(other_expenses or 0)
    
    # ========== CÁLCULOS ==========
    
    # Lucro Bruto = Receita Líquida - Comissões
    gross_profit = total_income_net - float(total_commissions or 0)
    
    # Lucro Operacional = Lucro Bruto - Outras Despesas
    operating_profit = gross_profit - float(total_purchases or 0) - float(other_expenses or 0)
    
    # Margem
    gross_margin = (gross_profit / total_income_net * 100) if total_income_net > 0 else 0
    operating_margin = (operating_profit / total_income_net * 100) if total_income_net > 0 else 0
    
    # ========== DRE POR MÊS ==========
    
    dre_by_month = db.query(
        func.to_char(FinancialTransaction.date, 'YYYY-MM').label('month'),
        func.sum(
            case(
                (FinancialTransaction.type == "income", FinancialTransaction.net_value),
                else_=0
            )
        ).label('income'),
        func.sum(
            case(
                (FinancialTransaction.type == "expense", FinancialTransaction.value),
                else_=0
            )
        ).label('expense')
    ).filter(
        FinancialTransaction.company_id == current_user.company_id,
        FinancialTransaction.date >= start_date,
        FinancialTransaction.date <= end_date
    ).group_by(func.to_char(FinancialTransaction.date, 'YYYY-MM')).all()
    
    return {
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        "dre": {
            # Receitas
            "receita_bruta": float(total_income_gross),
            "taxas_gateway": float(total_fees),
            "receita_liquida": float(total_income_net),
            
            # Custos Diretos
            "comissoes": float(total_commissions or 0),
            "lucro_bruto": float(gross_profit),
            "margem_bruta": float(gross_margin),
            
            # Despesas Operacionais
            "compras": float(total_purchases or 0),
            "outras_despesas": float(other_expenses or 0),
            "total_despesas_operacionais": float(total_purchases or 0) + float(other_expenses or 0),
            
            # Resultado
            "lucro_operacional": float(operating_profit),
            "margem_operacional": float(operating_margin),
            "lucro_liquido": float(operating_profit)  # Simplificado (sem impostos por enquanto)
        },
        "income_by_origin": [
            {
                "origin": item.origin,
                "gross": float(item.total or 0),
                "net": float(item.net_total or 0),
                "fees": float(item.total or 0) - float(item.net_total or 0),
                "count": item.count
            }
            for item in income_by_origin
        ],
        "by_month": [
            {
                "month": item.month,
                "income": float(item.income or 0),
                "expense": float(item.expense or 0),
                "profit": float(item.income or 0) - float(item.expense or 0)
            }
            for item in dre_by_month
        ]
    }


# ========== PROJEÇÃO DE FATURAMENTO ==========

@router.get("/revenue-forecast")
async def get_revenue_forecast(
    months_ahead: int = Query(3, ge=1, le=12),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Projeção de Faturamento
    Baseado em histórico + assinaturas + comandas em aberto
    """
    today = datetime.now().date()
    
    # ========== HISTÓRICO (últimos 6 meses) ==========
    
    historical_months = []
    for i in range(6):
        month_start = (today.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        month_revenue = db.query(
            func.sum(FinancialTransaction.value)
        ).filter(
            FinancialTransaction.company_id == current_user.company_id,
            FinancialTransaction.type == "income",
            FinancialTransaction.date >= month_start,
            FinancialTransaction.date <= month_end
        ).scalar() or 0
        
        historical_months.append({
            "month": month_start.strftime("%Y-%m"),
            "revenue": float(month_revenue),
            "type": "historical"
        })
    
    historical_months.reverse()
    
    # Calcular média histórica
    avg_historical = sum(m["revenue"] for m in historical_months) / len(historical_months) if historical_months else 0
    
    # ========== RECEITA RECORRENTE (MRR) ==========
    
    # Assinaturas ativas com JOIN no modelo para obter monthly_value
    from sqlalchemy.sql import Numeric as SQLNumeric
    
    active_subscriptions = db.query(
        func.count(SubscriptionSale.id).label('count'),
        func.sum(SubscriptionSaleModel.monthly_value).label('mrr')
    ).join(
        SubscriptionSaleModel,
        SubscriptionSaleModel.id == SubscriptionSale.model_id
    ).filter(
        SubscriptionSale.company_id == current_user.company_id,
        SubscriptionSale.status == SubscriptionSaleStatus.ACTIVE
    ).first()
    
    mrr = float(active_subscriptions.mrr or 0) if active_subscriptions and active_subscriptions.mrr else 0
    subscription_count = active_subscriptions.count if active_subscriptions else 0
    
    # ========== COMANDAS EM ABERTO (A RECEBER) ==========
    
    commands_open = db.query(
        func.sum(Command.total_value)
    ).filter(
        Command.company_id == current_user.company_id,
        Command.status.in_(["OPEN", "IN_PROGRESS"])
    ).scalar() or 0
    
    # ========== PROJEÇÃO ==========
    
    forecast_months = []
    growth_rate = 1.05  # 5% de crescimento mensal (ajustar conforme histórico)
    
    base_revenue = avg_historical
    
    for i in range(1, months_ahead + 1):
        forecast_date = (today.replace(day=1) + timedelta(days=i * 30)).replace(day=1)
        
        # Projeção = Média histórica * crescimento + MRR
        projected_variable = base_revenue * (growth_rate ** i)
        projected_recurring = mrr
        projected_total = projected_variable + projected_recurring
        
        forecast_months.append({
            "month": forecast_date.strftime("%Y-%m"),
            "projected_variable": float(projected_variable),
            "projected_recurring": float(projected_recurring),
            "projected_total": float(projected_total),
            "type": "forecast"
        })
    
    return {
        "historical": historical_months,
        "forecast": forecast_months,
        "metrics": {
            "avg_historical_revenue": float(avg_historical),
            "mrr": float(mrr),
            "active_subscriptions": subscription_count,
            "commands_open_value": float(commands_open or 0),
            "growth_rate": float((growth_rate - 1) * 100)  # Em percentual
        }
    }


# ========== RELATÓRIO DE COMISSÕES ==========

@router.get("/commissions")
async def get_commissions_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    professional_id: Optional[int] = None,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Relatório de comissões por profissional
    """
    query = db.query(
        User.id.label('professional_id'),
        User.full_name.label('professional_name'),
        func.count(Commission.id).label('commission_count'),
        func.sum(Commission.base_value).label('total_base'),
        func.sum(Commission.commission_value).label('total_commission'),
        func.sum(
            case(
                (Commission.status == CommissionStatus.PAID, Commission.commission_value),
                else_=0
            )
        ).label('total_paid'),
        func.sum(
            case(
                (Commission.status == CommissionStatus.PENDING, Commission.commission_value),
                else_=0
            )
        ).label('total_pending')
    ).join(
        Commission,
        Commission.professional_id == User.id
    ).filter(
        Commission.company_id == current_user.company_id,
        Commission.created_at >= start_date,
        Commission.created_at <= end_date
    )
    
    if professional_id:
        query = query.filter(User.id == professional_id)
    
    results = query.group_by(User.id, User.full_name).all()
    
    total_commissions = sum(float(r.total_commission or 0) for r in results)
    total_paid = sum(float(r.total_paid or 0) for r in results)
    total_pending = sum(float(r.total_pending or 0) for r in results)
    
    return {
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        "summary": {
            "total_commissions": float(total_commissions),
            "total_paid": float(total_paid),
            "total_pending": float(total_pending),
            "payment_rate": (total_paid / total_commissions * 100) if total_commissions > 0 else 0
        },
        "by_professional": [
            {
                "professional_id": r.professional_id,
                "professional_name": r.professional_name,
                "commission_count": r.commission_count,
                "total_base": float(r.total_base or 0),
                "total_commission": float(r.total_commission or 0),
                "total_paid": float(r.total_paid or 0),
                "total_pending": float(r.total_pending or 0),
                "payment_rate": (float(r.total_paid or 0) / float(r.total_commission or 0) * 100) if r.total_commission else 0
            }
            for r in results
        ]
    }


# ========== RELATÓRIO POR SERVIÇO ==========

@router.get("/by-service")
async def get_by_service_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Relatório de receita e performance por serviço
    """
    from app.models.command import CommandItem
    from app.models.service import Service
    
    results = db.query(
        Service.id.label('service_id'),
        Service.name.label('service_name'),
        func.count(CommandItem.id).label('item_count'),
        func.sum(CommandItem.final_value).label('total_revenue'),
        func.avg(CommandItem.final_value).label('avg_value')
    ).join(
        CommandItem,
        CommandItem.service_id == Service.id
    ).join(
        Command,
        Command.id == CommandItem.command_id
    ).filter(
        Command.company_id == current_user.company_id,
        Command.date >= start_date,
        Command.date <= end_date,
        Command.status == CommandStatus.FINISHED
    ).group_by(Service.id, Service.name).order_by(func.sum(CommandItem.final_value).desc()).all()
    
    total_revenue = sum(float(r.total_revenue or 0) for r in results)
    
    return {
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        "total_revenue": float(total_revenue),
        "services": [
            {
                "service_id": r.service_id,
                "service_name": r.service_name,
                "item_count": r.item_count,
                "total_revenue": float(r.total_revenue or 0),
                "avg_value": float(r.avg_value or 0),
                "percentage": (float(r.total_revenue or 0) / total_revenue * 100) if total_revenue > 0 else 0
            }
            for r in results
        ]
    }


# ========== RELATÓRIO POR PROFISSIONAL ==========

@router.get("/by-professional")
async def get_by_professional_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Relatório de performance por profissional
    """
    from app.models.review import Review
    
    results = db.query(
        User.id.label('professional_id'),
        User.full_name.label('professional_name'),
        func.count(func.distinct(Command.id)).label('command_count'),
        func.sum(Command.total_value).label('total_revenue'),
        func.avg(Command.total_value).label('avg_ticket'),
        func.avg(Review.rating).label('avg_rating')
    ).join(
        Command,
        Command.professional_id == User.id
    ).outerjoin(
        Review,
        and_(
            Review.professional_id == User.id,
            Review.created_at >= start_date,
            Review.created_at <= end_date
        )
    ).filter(
        Command.company_id == current_user.company_id,
        Command.date >= start_date,
        Command.date <= end_date,
        Command.status == CommandStatus.FINISHED
    ).group_by(User.id, User.full_name).order_by(func.sum(Command.total_value).desc()).all()
    
    # Buscar comissões de cada profissional
    commissions_by_prof = db.query(
        Commission.professional_id,
        func.sum(Commission.commission_value).label('total_commission')
    ).filter(
        Commission.company_id == current_user.company_id,
        Commission.created_at >= start_date,
        Commission.created_at <= end_date
    ).group_by(Commission.professional_id).all()
    
    commission_dict = {c.professional_id: float(c.total_commission or 0) for c in commissions_by_prof}
    
    total_revenue = sum(float(r.total_revenue or 0) for r in results)
    
    return {
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        "total_revenue": float(total_revenue),
        "professionals": [
            {
                "professional_id": r.professional_id,
                "professional_name": r.professional_name,
                "command_count": r.command_count,
                "total_revenue": float(r.total_revenue or 0),
                "avg_ticket": float(r.avg_ticket or 0),
                "total_commission": commission_dict.get(r.professional_id, 0),
                "avg_rating": float(r.avg_rating or 0) if r.avg_rating else None,
                "percentage": (float(r.total_revenue or 0) / total_revenue * 100) if total_revenue > 0 else 0
            }
            for r in results
        ]
    }


# ========== RELATÓRIO DE CLIENTES ==========

@router.get("/by-client")
async def get_by_client_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    min_revenue: Optional[float] = None,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Relatório de clientes (Top clientes por faturamento)
    """
    query = db.query(
        Client.id.label('client_id'),
        Client.full_name.label('client_name'),
        func.count(Command.id).label('command_count'),
        func.sum(Command.total_value).label('total_revenue'),
        func.max(Command.date).label('last_visit'),
        func.min(Command.date).label('first_visit')
    ).join(
        Command,
        Command.client_id == Client.id
    ).filter(
        Command.company_id == current_user.company_id,
        Command.date >= start_date,
        Command.date <= end_date,
        Command.status == CommandStatus.FINISHED
    ).group_by(Client.id, Client.full_name)
    
    if min_revenue:
        query = query.having(func.sum(Command.total_value) >= min_revenue)
    
    results = query.order_by(func.sum(Command.total_value).desc()).limit(50).all()
    
    total_revenue = sum(float(r.total_revenue or 0) for r in results)
    
    return {
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        "total_revenue": float(total_revenue),
        "clients": [
            {
                "client_id": r.client_id,
                "client_name": r.client_name,
                "command_count": r.command_count,
                "total_revenue": float(r.total_revenue or 0),
                "avg_ticket": float(r.total_revenue or 0) / r.command_count if r.command_count > 0 else 0,
                "last_visit": r.last_visit.isoformat() if r.last_visit else None,
                "first_visit": r.first_visit.isoformat() if r.first_visit else None,
                "percentage": (float(r.total_revenue or 0) / total_revenue * 100) if total_revenue > 0 else 0
            }
            for r in results
        ]
    }


# ========== RELATÓRIO CONSOLIDADO ==========

@router.get("/consolidated")
async def get_consolidated_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Relatório consolidado com todas as métricas principais
    """
    # Buscar todos os relatórios em paralelo
    expenses = await get_expenses_report(start_date, end_date, None, current_user, db)
    financial_results = await get_financial_results(start_date, end_date, current_user, db)
    forecast = await get_revenue_forecast(3, current_user, db)
    by_service = await get_by_service_report(start_date, end_date, current_user, db)
    by_professional = await get_by_professional_report(start_date, end_date, current_user, db)
    
    return {
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        "expenses": expenses,
        "financial_results": financial_results,
        "revenue_forecast": forecast,
        "by_service": by_service,
        "by_professional": by_professional,
        "generated_at": datetime.now().isoformat()
    }

