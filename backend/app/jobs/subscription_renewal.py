"""
Subscription Renewal Job
Processa renovações automáticas de assinaturas
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from typing import List

from app.models.subscription_sale import SubscriptionSale, SubscriptionSaleModel, SubscriptionSaleStatus
from app.models.financial import FinancialTransaction
from app.models.client import Client
from app.core.database import SessionLocal

import logging

logger = logging.getLogger(__name__)


def process_subscription_renewals(db: Session = None) -> dict:
    """
    Processa renovações de assinaturas pendentes
    
    Retorna:
        dict com estatísticas do processamento
    """
    if db is None:
        db = SessionLocal()
        close_db = True
    else:
        close_db = False
    
    try:
        today = datetime.now().date()
        stats = {
            "total_processed": 0,
            "success": 0,
            "failed": 0,
            "errors": []
        }
        
        # Buscar assinaturas com pagamento vencido
        subscriptions = db.query(SubscriptionSale).filter(
            SubscriptionSale.status == SubscriptionSaleStatus.ACTIVE,
            SubscriptionSale.next_payment_date <= today
        ).all()
        
        stats["total_processed"] = len(subscriptions)
        
        if not subscriptions:
            logger.info("Nenhuma assinatura pendente de renovação")
            return stats
        
        logger.info(f"Processando {len(subscriptions)} assinaturas para renovação")
        
        for subscription in subscriptions:
            try:
                # Buscar modelo
                model = db.query(SubscriptionSaleModel).filter(
                    SubscriptionSaleModel.id == subscription.model_id
                ).first()
                
                if not model:
                    logger.error(f"Modelo não encontrado para assinatura {subscription.id}")
                    stats["failed"] += 1
                    stats["errors"].append(f"Assinatura {subscription.id}: Modelo não encontrado")
                    continue
                
                # Buscar cliente para descrição
                client = db.query(Client).filter(
                    Client.id == subscription.client_crm_id
                ).first()
                
                client_name = client.full_name if client else "Cliente"
                
                # ✅ CRIAR TRANSAÇÃO FINANCEIRA
                financial_transaction = FinancialTransaction(
                    company_id=subscription.company_id,
                    type="income",
                    origin="subscription",
                    subscription_sale_id=subscription.id,
                    client_id=subscription.client_crm_id,
                    value=model.monthly_value,
                    net_value=model.monthly_value,
                    date=datetime.now(),
                    description=f"Renovação automática - {model.name} - {client_name}",
                    status="planned",  # Planejado até confirmar pagamento
                    is_paid=False  # Marcar como pago quando gateway confirmar
                )
                db.add(financial_transaction)
                
                # Atualizar próxima data de pagamento
                subscription.next_payment_date = datetime.now().date() + timedelta(days=30)
                
                # Se tiver integração com gateway, atualizar last_payment_date apenas quando confirmar
                # Por enquanto, apenas atualiza next_payment_date
                
                # Resetar uso mensal
                subscription.current_month_credits_used = 0
                if model.services_included:
                    subscription.current_month_services_used = {
                        str(service_id): 0 for service_id in model.services_included
                    }
                
                db.commit()
                
                stats["success"] += 1
                logger.info(
                    f"Assinatura {subscription.id} renovada com sucesso. "
                    f"Transação {financial_transaction.id} criada."
                )
                
            except Exception as e:
                db.rollback()
                stats["failed"] += 1
                error_msg = f"Assinatura {subscription.id}: {str(e)}"
                stats["errors"].append(error_msg)
                logger.error(f"Erro ao processar assinatura {subscription.id}: {e}")
                continue
        
        logger.info(
            f"Processamento concluído: {stats['success']} sucesso, "
            f"{stats['failed']} falhas de {stats['total_processed']} total"
        )
        
        return stats
        
    except Exception as e:
        logger.error(f"Erro geral no processamento de renovações: {e}")
        raise
    
    finally:
        if close_db:
            db.close()


def mark_subscription_payment_confirmed(
    subscription_id: int,
    transaction_id: int,
    db: Session
) -> bool:
    """
    Marca pagamento de assinatura como confirmado
    
    Args:
        subscription_id: ID da assinatura
        transaction_id: ID da transação financeira
        db: Sessão do banco
    
    Retorna:
        bool indicando sucesso
    """
    try:
        # Buscar transação
        transaction = db.query(FinancialTransaction).filter(
            FinancialTransaction.id == transaction_id
        ).first()
        
        if not transaction:
            logger.error(f"Transação {transaction_id} não encontrada")
            return False
        
        # Buscar assinatura
        subscription = db.query(SubscriptionSale).filter(
            SubscriptionSale.id == subscription_id
        ).first()
        
        if not subscription:
            logger.error(f"Assinatura {subscription_id} não encontrada")
            return False
        
        # Atualizar transação
        transaction.status = "liquidated"
        transaction.is_paid = True
        
        # Atualizar assinatura
        subscription.last_payment_date = datetime.now()
        
        db.commit()
        
        logger.info(
            f"Pagamento de assinatura {subscription_id} confirmado. "
            f"Transação {transaction_id} liquidada."
        )
        
        return True
        
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao confirmar pagamento: {e}")
        return False


if __name__ == "__main__":
    # Para testes manuais
    logging.basicConfig(level=logging.INFO)
    print("Processando renovações de assinaturas...")
    result = process_subscription_renewals()
    print(f"Resultado: {result}")

