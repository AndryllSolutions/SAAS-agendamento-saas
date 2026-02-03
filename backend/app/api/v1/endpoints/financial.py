"""
Financial Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import func, case

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.models.user import User
from app.models.financial import (
    FinancialAccount, PaymentForm, FinancialCategory, FinancialTransaction,
    CashRegister, TransactionType, TransactionStatus, TransactionOrigin
)
from app.models.company_configurations import CompanyFinancialSettings
from app.schemas.financial import (
    FinancialAccountCreate, FinancialAccountUpdate, FinancialAccountResponse,
    PaymentFormCreate, PaymentFormUpdate, PaymentFormResponse,
    FinancialCategoryCreate, FinancialCategoryUpdate, FinancialCategoryResponse,
    FinancialTransactionCreate, FinancialTransactionUpdate, FinancialTransactionResponse,
    CashRegisterCreate, CashRegisterUpdate, CashRegisterResponse,
    FinancialDashboard
)

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


def apply_transaction_filters(
    query,
    type: Optional[List[TransactionType]] = None,
    status: Optional[List[TransactionStatus]] = None,
    payment_method: Optional[List[str]] = None,
    account_id: Optional[List[int]] = None,
    category_id: Optional[List[int]] = None,
    is_paid: Optional[bool] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    client_id: Optional[int] = None,
    date_type: Optional[str] = None,
):
    # date_type placeholder: FinancialTransaction only has date column today
    if type:
        query = query.filter(FinancialTransaction.type.in_(type))

    if status:
        query = query.filter(FinancialTransaction.status.in_(status))

    if payment_method:
        query = query.filter(FinancialTransaction.payment_method.in_(payment_method))

    if account_id:
        query = query.filter(FinancialTransaction.account_id.in_(account_id))

    if category_id:
        query = query.filter(FinancialTransaction.category_id.in_(category_id))

    if is_paid is not None:
        query = query.filter(FinancialTransaction.is_paid == is_paid)

    if start_date:
        query = query.filter(FinancialTransaction.date >= datetime.combine(start_date, datetime.min.time()))

    if end_date:
        query = query.filter(FinancialTransaction.date <= datetime.combine(end_date, datetime.max.time()))

    if client_id:
        query = query.filter(FinancialTransaction.client_id == client_id)

    return query


# ========== FINANCIAL ACCOUNTS ==========

@router.post("/accounts", response_model=FinancialAccountResponse, status_code=status.HTTP_201_CREATED)
async def create_financial_account(
    account_data: FinancialAccountCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Create a new financial account"""
    if account_data.company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    account = FinancialAccount(**account_data.dict())
    db.add(account)
    db.commit()
    db.refresh(account)
    return FinancialAccountResponse.model_validate(account)


@router.get("/accounts", response_model=List[FinancialAccountResponse])
async def list_financial_accounts(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List financial accounts"""
    accounts = db.query(FinancialAccount).filter(
        FinancialAccount.company_id == current_user.company_id
    ).all()
    return [FinancialAccountResponse.model_validate(acc) for acc in accounts]


@router.put("/accounts/{account_id}", response_model=FinancialAccountResponse)
async def update_financial_account(
    account_id: int,
    account_data: FinancialAccountUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update financial account"""
    account = db.query(FinancialAccount).filter(
        FinancialAccount.id == account_id,
        FinancialAccount.company_id == current_user.company_id
    ).first()
    
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    update_data = account_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(account, field, value)
    
    db.commit()
    db.refresh(account)
    return FinancialAccountResponse.model_validate(account)


@router.delete("/accounts/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_financial_account(
    account_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete financial account"""
    account = db.query(FinancialAccount).filter(
        FinancialAccount.id == account_id,
        FinancialAccount.company_id == current_user.company_id
    ).first()
    
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    db.delete(account)
    db.commit()
    return None


# ========== PAYMENT FORMS ==========

@router.post("/payment-forms", response_model=PaymentFormResponse, status_code=status.HTTP_201_CREATED)
async def create_payment_form(
    form_data: PaymentFormCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Create a new payment form"""
    if form_data.company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    form = PaymentForm(**form_data.dict())
    db.add(form)
    db.commit()
    db.refresh(form)
    return PaymentFormResponse.model_validate(form)


@router.get("/payment-forms", response_model=List[PaymentFormResponse])
async def list_payment_forms(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List payment forms"""
    forms = db.query(PaymentForm).filter(
        PaymentForm.company_id == current_user.company_id
    ).all()
    return [PaymentFormResponse.model_validate(f) for f in forms]


@router.put("/payment-forms/{form_id}", response_model=PaymentFormResponse)
async def update_payment_form(
    form_id: int,
    form_data: PaymentFormUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update payment form"""
    form = db.query(PaymentForm).filter(
        PaymentForm.id == form_id,
        PaymentForm.company_id == current_user.company_id
    ).first()
    
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    update_data = form_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(form, field, value)
    
    db.commit()
    db.refresh(form)
    return PaymentFormResponse.model_validate(form)


@router.delete("/payment-forms/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_payment_form(
    form_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete payment form"""
    form = db.query(PaymentForm).filter(
        PaymentForm.id == form_id,
        PaymentForm.company_id == current_user.company_id
    ).first()
    
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    db.delete(form)
    db.commit()
    return None


# ========== FINANCIAL CATEGORIES ==========

@router.post("/categories", response_model=FinancialCategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_financial_category(
    category_data: FinancialCategoryCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Create a new financial category"""
    if category_data.company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    category = FinancialCategory(**category_data.dict())
    db.add(category)
    db.commit()
    db.refresh(category)
    return FinancialCategoryResponse.model_validate(category)


@router.get("/categories", response_model=List[FinancialCategoryResponse])
async def list_financial_categories(
    type: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List financial categories"""
    query = db.query(FinancialCategory).filter(
        FinancialCategory.company_id == current_user.company_id
    )
    
    if type:
        query = query.filter(FinancialCategory.type == type)
    
    categories = query.all()
    return [FinancialCategoryResponse.model_validate(cat) for cat in categories]


@router.put("/categories/{category_id}", response_model=FinancialCategoryResponse)
async def update_financial_category(
    category_id: int,
    category_data: FinancialCategoryUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update financial category"""
    category = db.query(FinancialCategory).filter(
        FinancialCategory.id == category_id,
        FinancialCategory.company_id == current_user.company_id
    ).first()
    
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    update_data = category_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    
    db.commit()
    db.refresh(category)
    return FinancialCategoryResponse.model_validate(category)


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_financial_category(
    category_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete financial category"""
    category = db.query(FinancialCategory).filter(
        FinancialCategory.id == category_id,
        FinancialCategory.company_id == current_user.company_id
    ).first()
    
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    db.delete(category)
    db.commit()
    return None


# ========== FINANCIAL TRANSACTIONS ==========

@router.post("/transactions", response_model=FinancialTransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_financial_transaction(
    transaction_data: FinancialTransactionCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Create a new financial transaction"""
    if transaction_data.company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    # Obter configuracoes financeiras da empresa
    financial_settings = db.query(CompanyFinancialSettings).filter(
        CompanyFinancialSettings.company_id == current_user.company_id
    ).first()
    
    if financial_settings:
        # Validar lancamentos retroativos
        transaction_date = transaction_data.date.date() if isinstance(transaction_data.date, datetime) else transaction_data.date
        if transaction_date < date.today() and not financial_settings.allow_retroactive_entries:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lancamentos retroativos nao permitidos. Ajuste nas configuracoes da empresa."
            )
        
        # Validar categoria obrigatoria
        if financial_settings.require_category_on_transaction and not transaction_data.category_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Categoria e obrigatoria para transacoes."
            )
        
        # Validar forma de pagamento obrigatoria
        if financial_settings.require_payment_form_on_transaction and not transaction_data.payment_form_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Forma de pagamento e obrigatoria para transacoes."
            )
        
        # Validar operacoes com caixa fechado
        if not financial_settings.allow_operations_with_closed_cash:
            # Verificar se existe caixa aberto
            open_cash = db.query(CashRegister).filter(
                CashRegister.company_id == current_user.company_id,
                CashRegister.is_open == True
            ).first()
            
            if not open_cash:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Nao e permitido criar transacoes com o caixa fechado. Abra o caixa ou ajuste nas configuracoes."
                )
    
    transaction = FinancialTransaction(**transaction_data.dict())
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return FinancialTransactionResponse.model_validate(transaction)


@router.get("/transactions", response_model=List[FinancialTransactionResponse])
async def list_financial_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    type: Optional[List[TransactionType]] = Query(None),
    status: Optional[List[TransactionStatus]] = Query(None),
    payment_method: Optional[List[str]] = Query(None),
    account_id: Optional[List[int]] = Query(None),
    category_id: Optional[List[int]] = Query(None),
    is_paid: Optional[bool] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    date_type: Optional[str] = Query(None),
    client_id: Optional[int] = Query(None, description="Filter by client ID"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List financial transactions (Optimized with eager loading)"""
    from sqlalchemy.orm import joinedload
    
    # Optimized query with eager loading
    query = db.query(FinancialTransaction).options(
        joinedload(FinancialTransaction.account),
        joinedload(FinancialTransaction.category),
        joinedload(FinancialTransaction.client),
    ).filter(
        FinancialTransaction.company_id == current_user.company_id
    )
    
    query = apply_transaction_filters(
        query=query,
        type=type,
        status=status,
        payment_method=payment_method,
        account_id=account_id,
        category_id=category_id,
        is_paid=is_paid,
        start_date=start_date,
        end_date=end_date,
        client_id=client_id,
        date_type=date_type,
    )
    
    # Use index for ordering
    transactions = query.order_by(FinancialTransaction.date.desc()).offset(skip).limit(limit).all()
    return [FinancialTransactionResponse.model_validate(t) for t in transactions]


@router.get("/transactions/totals", response_model=dict)
async def get_transactions_totals(
    type: Optional[List[TransactionType]] = Query(None),
    status: Optional[List[TransactionStatus]] = Query(None),
    payment_method: Optional[List[str]] = Query(None),
    account_id: Optional[List[int]] = Query(None),
    category_id: Optional[List[int]] = Query(None),
    is_paid: Optional[bool] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    date_type: Optional[str] = Query(None),
    client_id: Optional[int] = Query(None, description="Filter by client ID"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Calculate totals for transactions"""
    query = db.query(FinancialTransaction).filter(
        FinancialTransaction.company_id == current_user.company_id
    )
    
    query = apply_transaction_filters(
        query=query,
        type=type,
        status=status,
        payment_method=payment_method,
        account_id=account_id,
        category_id=category_id,
        is_paid=is_paid,
        start_date=start_date,
        end_date=end_date,
        client_id=client_id,
        date_type=date_type,
    )

    transactions = query.all()

    total_gross = sum(float(t.value) for t in transactions)
    total_net = sum(float(t.net_value or t.value) for t in transactions)
    total_fees = sum(float(t.fee_value or 0) for t in transactions)

    total_received = sum(float(t.net_value or t.value) for t in transactions
                         if t.type == TransactionType.INCOME and t.is_paid)
    total_to_receive = sum(float(t.net_value or t.value) for t in transactions
                           if t.type == TransactionType.INCOME and not t.is_paid)
    total_paid = sum(float(t.net_value or t.value) for t in transactions
                     if t.type == TransactionType.EXPENSE and t.is_paid)
    total_to_pay = sum(float(t.net_value or t.value) for t in transactions
                       if t.type == TransactionType.EXPENSE and not t.is_paid)

    return {
        "total_gross": total_gross,
        "total_net": total_net,
        "total_fees": total_fees,
        "count": len(transactions),
        "total_received": total_received,
        "total_to_receive": total_to_receive,
        "total_paid": total_paid,
        "total_to_pay": total_to_pay,
    }


@router.put("/transactions/{transaction_id}/toggle-paid", response_model=FinancialTransactionResponse)
async def toggle_transaction_paid(
    transaction_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Toggle is_paid status of a transaction"""
    transaction = db.query(FinancialTransaction).filter(
        FinancialTransaction.id == transaction_id,
        FinancialTransaction.company_id == current_user.company_id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    transaction.is_paid = not transaction.is_paid
    if transaction.is_paid and transaction.status == TransactionStatus.PLANNED:
        transaction.status = TransactionStatus.LIQUIDATED
    
    db.commit()
    db.refresh(transaction)
    return FinancialTransactionResponse.model_validate(transaction)


@router.get("/transactions/{transaction_id}", response_model=FinancialTransactionResponse)
async def get_financial_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get financial transaction by ID"""
    transaction = db.query(FinancialTransaction).filter(
        FinancialTransaction.id == transaction_id,
        FinancialTransaction.company_id == current_user.company_id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return transaction


@router.put("/transactions/{transaction_id}", response_model=FinancialTransactionResponse)
async def update_financial_transaction(
    transaction_id: int,
    transaction_data: FinancialTransactionUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update financial transaction"""
    transaction = db.query(FinancialTransaction).filter(
        FinancialTransaction.id == transaction_id,
        FinancialTransaction.company_id == current_user.company_id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    update_data = transaction_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(transaction, field, value)
    
    db.commit()
    db.refresh(transaction)
    return FinancialTransactionResponse.model_validate(transaction)


@router.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_financial_transaction(
    transaction_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete financial transaction"""
    transaction = db.query(FinancialTransaction).filter(
        FinancialTransaction.id == transaction_id,
        FinancialTransaction.company_id == current_user.company_id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    db.delete(transaction)
    db.commit()
    return None


# ========== CASH REGISTERS ==========

@router.post("/cash-registers/open", response_model=CashRegisterResponse, status_code=status.HTTP_201_CREATED)
async def open_cash_register(
    register_data: CashRegisterCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Open a cash register"""
    if register_data.company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    # Check if there's an open register
    open_register = db.query(CashRegister).filter(
        CashRegister.company_id == current_user.company_id,
        CashRegister.is_open == True
    ).first()
    
    if open_register:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um caixa aberto"
        )
    
    register = CashRegister(
        company_id=current_user.company_id,
        user_id=current_user.id,
        opening_balance=register_data.opening_balance,
        opening_date=datetime.now(),
        is_open=True
    )
    db.add(register)
    db.commit()
    db.refresh(register)
    return CashRegisterResponse.model_validate(register)


@router.get("/cash-registers", response_model=List[CashRegisterResponse])
async def list_cash_registers(
    is_open: Optional[bool] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List cash registers"""
    query = db.query(CashRegister).filter(
        CashRegister.company_id == current_user.company_id
    )
    
    if is_open is not None:
        query = query.filter(CashRegister.is_open == is_open)
    
    registers = query.order_by(CashRegister.opening_date.desc()).all()
    return [CashRegisterResponse.model_validate(r) for r in registers]


@router.get("/cash-registers/{register_id}/conference", response_model=dict)
async def get_cash_register_conference(
    register_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get cash register conference data"""
    register = db.query(CashRegister).filter(
        CashRegister.id == register_id,
        CashRegister.company_id == current_user.company_id
    ).first()
    
    if not register:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    # Get transactions for this cash register period
    start_date = register.opening_date
    end_date = register.closing_date if register.closing_date else datetime.now()
    
    # Get cash transactions (cash payments)
    cash_transactions = db.query(func.sum(FinancialTransaction.value)).filter(
        FinancialTransaction.company_id == current_user.company_id,
        FinancialTransaction.payment_method == "cash",
        FinancialTransaction.type == TransactionType.INCOME,
        FinancialTransaction.status == TransactionStatus.LIQUIDATED,
        FinancialTransaction.date >= start_date,
        FinancialTransaction.date <= end_date
    ).scalar() or Decimal(0)
    
    # Get other payment methods
    payment_methods_query = db.query(
        FinancialTransaction.payment_method,
        func.sum(FinancialTransaction.value).label('total')
    ).filter(
        FinancialTransaction.company_id == current_user.company_id,
        FinancialTransaction.type == TransactionType.INCOME,
        FinancialTransaction.status == TransactionStatus.LIQUIDATED,
        FinancialTransaction.date >= start_date,
        FinancialTransaction.date <= end_date,
        FinancialTransaction.payment_method.isnot(None),
        FinancialTransaction.payment_method != "cash"
    ).group_by(FinancialTransaction.payment_method).all()
    
    other_payments = {}
    total_received = Decimal(0)
    total_to_receive = Decimal(0)
    
    for row in payment_methods_query:
        method = row.payment_method
        total = row.total or Decimal(0)
        other_payments[method] = {
            "total": float(total),
            "available_days": 30 if method == "credit_card" else 0  # Credit card typically has delay
        }
        total_received += total
    
    # Get planned transactions (to receive)
    to_receive_query = db.query(
        FinancialTransaction.payment_method,
        func.sum(FinancialTransaction.value).label('total')
    ).filter(
        FinancialTransaction.company_id == current_user.company_id,
        FinancialTransaction.type == TransactionType.INCOME,
        FinancialTransaction.status == TransactionStatus.PLANNED,
        FinancialTransaction.date >= start_date,
        FinancialTransaction.date <= end_date,
        FinancialTransaction.payment_method.isnot(None)
    ).group_by(FinancialTransaction.payment_method).all()
    
    for row in to_receive_query:
        method = row.payment_method
        total = row.total or Decimal(0)
        total_to_receive += total
    
    # Calculate movements (cash received)
    movements = float(cash_transactions)
    
    # Calculate cash balance
    cash_balance = float(register.opening_balance) + movements
    
    return {
        "opening_balance": float(register.opening_balance),
        "movements": movements,
        "cash_balance": cash_balance,
        "other_payments": other_payments,
        "total_received": float(total_received),
        "total_to_receive": float(total_to_receive),
        "payment_summary": register.payment_summary or {}
    }


@router.post("/cash-registers/{register_id}/close", response_model=CashRegisterResponse)
async def close_cash_register(
    register_id: int,
    register_data: CashRegisterUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Close a cash register"""
    register = db.query(CashRegister).filter(
        CashRegister.id == register_id,
        CashRegister.company_id == current_user.company_id
    ).first()
    
    if not register:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    if not register.is_open:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Caixa já está fechado"
        )
    
    register.closing_date = datetime.now()
    register.closing_balance = register_data.closing_balance
    register.payment_summary = register_data.payment_summary
    register.is_open = False
    
    db.commit()
    db.refresh(register)
    return CashRegisterResponse.model_validate(register)


# ========== FINANCIAL DASHBOARD ==========

@router.get("/dashboard", response_model=FinancialDashboard)
async def get_financial_dashboard(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get financial dashboard data (Cached for 2 minutes)"""
    from app.core.cache import get_cache, set_cache
    
    today = datetime.now().date()
    
    if not start_date:
        start_date = today
    if not end_date:
        end_date = today
    
    # Cache key
    cache_key = f"financial:dashboard:{current_user.company_id}:{start_date}:{end_date}"
    
    # Try cache first
    cached = await get_cache(cache_key)
    if cached:
        # ✅ CORREÇÃO: Retornar dict do cache (FastAPI converte automaticamente)
        return FinancialDashboard(**cached)
    
    # Optimized queries using indexes
    # To receive today
    to_receive = db.query(func.sum(FinancialTransaction.value)).filter(
        FinancialTransaction.company_id == current_user.company_id,
        FinancialTransaction.type == TransactionType.INCOME,
        FinancialTransaction.status == TransactionStatus.PLANNED,
        func.date(FinancialTransaction.date) == today
    ).scalar() or Decimal(0)
    
    # To pay today
    to_pay = db.query(func.sum(FinancialTransaction.value)).filter(
        FinancialTransaction.company_id == current_user.company_id,
        FinancialTransaction.type == TransactionType.EXPENSE,
        FinancialTransaction.status == TransactionStatus.PLANNED,
        func.date(FinancialTransaction.date) == today
    ).scalar() or Decimal(0)
    
    # Cash position (from cash registers)
    cash_position = db.query(func.sum(CashRegister.opening_balance)).filter(
        CashRegister.company_id == current_user.company_id,
        CashRegister.is_open == True
    ).scalar() or Decimal(0)
    
    # Bank position (from accounts)
    bank_position = db.query(func.sum(FinancialAccount.balance)).filter(
        FinancialAccount.company_id == current_user.company_id,
        FinancialAccount.account_type == "bank",
        FinancialAccount.is_active == True
    ).scalar() or Decimal(0)
    
    # Total received in period (optimized with index)
    total_received = db.query(func.sum(FinancialTransaction.value)).filter(
        FinancialTransaction.company_id == current_user.company_id,
        FinancialTransaction.type == TransactionType.INCOME,
        FinancialTransaction.status == TransactionStatus.LIQUIDATED,
        FinancialTransaction.date >= datetime.combine(start_date, datetime.min.time()),
        FinancialTransaction.date <= datetime.combine(end_date, datetime.max.time())
    ).scalar() or Decimal(0)
    
    # Total paid in period (optimized with index)
    total_paid = db.query(func.sum(FinancialTransaction.value)).filter(
        FinancialTransaction.company_id == current_user.company_id,
        FinancialTransaction.type == TransactionType.EXPENSE,
        FinancialTransaction.status == TransactionStatus.LIQUIDATED,
        FinancialTransaction.date >= datetime.combine(start_date, datetime.min.time()),
        FinancialTransaction.date <= datetime.combine(end_date, datetime.max.time())
    ).scalar() or Decimal(0)
    
    # Total to receive in period (planned income)
    total_to_receive = db.query(func.sum(FinancialTransaction.value)).filter(
        FinancialTransaction.company_id == current_user.company_id,
        FinancialTransaction.type == TransactionType.INCOME,
        FinancialTransaction.status == TransactionStatus.PLANNED,
        FinancialTransaction.date >= datetime.combine(start_date, datetime.min.time()),
        FinancialTransaction.date <= datetime.combine(end_date, datetime.max.time())
    ).scalar() or Decimal(0)
    
    # Total to pay in period (planned expense)
    total_to_pay = db.query(func.sum(FinancialTransaction.value)).filter(
        FinancialTransaction.company_id == current_user.company_id,
        FinancialTransaction.type == TransactionType.EXPENSE,
        FinancialTransaction.status == TransactionStatus.PLANNED,
        FinancialTransaction.date >= datetime.combine(start_date, datetime.min.time()),
        FinancialTransaction.date <= datetime.combine(end_date, datetime.max.time())
    ).scalar() or Decimal(0)
    
    # Sales by day (optimized query)
    sales_by_day_query = db.query(
        func.date(FinancialTransaction.date).label('day'),
        func.sum(FinancialTransaction.value).label('total')
    ).filter(
        FinancialTransaction.company_id == current_user.company_id,
        FinancialTransaction.type == TransactionType.INCOME,
        FinancialTransaction.status == TransactionStatus.LIQUIDATED,
        FinancialTransaction.date >= datetime.combine(start_date, datetime.min.time()),
        FinancialTransaction.date <= datetime.combine(end_date, datetime.max.time())
    ).group_by(func.date(FinancialTransaction.date)).order_by(func.date(FinancialTransaction.date)).all()
    
    sales_by_day = [
        {"date": str(row.day), "total": float(row.total)}
        for row in sales_by_day_query
    ]
    
    # Cash flow by day (income, expense, accumulated balance)
    cash_flow_query = db.query(
        func.date(FinancialTransaction.date).label('day'),
        func.sum(
            case(
                (FinancialTransaction.type == TransactionType.INCOME, FinancialTransaction.value),
                else_=0
            )
        ).label('income'),
        func.sum(
            case(
                (FinancialTransaction.type == TransactionType.EXPENSE, FinancialTransaction.value),
                else_=0
            )
        ).label('expense')
    ).filter(
        FinancialTransaction.company_id == current_user.company_id,
        FinancialTransaction.status == TransactionStatus.LIQUIDATED,
        FinancialTransaction.date >= datetime.combine(start_date, datetime.min.time()),
        FinancialTransaction.date <= datetime.combine(end_date, datetime.max.time())
    ).group_by(func.date(FinancialTransaction.date)).order_by(func.date(FinancialTransaction.date)).all()
    
    # Calculate accumulated balance
    accumulated_balance = Decimal(0)
    cash_flow_by_day = []
    for row in cash_flow_query:
        income = Decimal(row.income or 0)
        expense = Decimal(row.expense or 0)
        accumulated_balance += (income - expense)
        cash_flow_by_day.append({
            "date": str(row.day),
            "income": float(income),
            "expense": float(expense),
            "balance": float(accumulated_balance)
        })
    
    result = FinancialDashboard(
        to_receive_today=to_receive,
        to_pay_today=to_pay,
        cash_position=cash_position,
        bank_position=bank_position,
        total_received_period=total_received,
        total_to_receive_period=total_to_receive,
        total_paid_period=total_paid,
        total_to_pay_period=total_to_pay,
        sales_by_day=sales_by_day,
        cash_flow_by_day=cash_flow_by_day
    )
    
    # ✅ CORREÇÃO: Converter para dict antes de cachear
    # Cache result for 2 minutes
    await set_cache(cache_key, result.model_dump(), ttl=120)
    
    return result

