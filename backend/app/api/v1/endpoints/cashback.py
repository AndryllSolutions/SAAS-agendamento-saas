"""
Cashback Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime
from decimal import Decimal

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.core.feature_flags import get_feature_checker
from app.models.user import User
from app.models.cashback import CashbackRule, CashbackBalance, CashbackTransaction
from app.models.client import Client
from app.schemas.cashback import (
    CashbackRuleCreate, CashbackRuleCreatePublic, CashbackRuleUpdate, CashbackRuleResponse,
    CashbackBalanceResponse, CashbackTransactionResponse
)

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


# ========== CASHBACK RULES ==========

@router.post("/rules", response_model=CashbackRuleResponse, status_code=status.HTTP_201_CREATED)
async def create_cashback_rule(
    rule_data: CashbackRuleCreatePublic,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db),
    _: None = Depends(get_feature_checker("cashback"))
):
    """Create a new cashback rule (company_id auto-filled from auth, feature-gated)"""
    rule = CashbackRule(**rule_data.model_dump(), company_id=current_user.company_id)
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.get("/rules", response_model=List[CashbackRuleResponse])
async def list_cashback_rules(
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List cashback rules"""
    query = db.query(CashbackRule).filter(CashbackRule.company_id == current_user.company_id)
    
    if is_active is not None:
        query = query.filter(CashbackRule.is_active == is_active)
    
    rules = query.all()
    return rules


@router.get("/rules/{rule_id}", response_model=CashbackRuleResponse)
async def get_cashback_rule(
    rule_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get cashback rule by ID"""
    rule = db.query(CashbackRule).filter(
        CashbackRule.id == rule_id,
        CashbackRule.company_id == current_user.company_id
    ).first()
    
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return rule


@router.put("/rules/{rule_id}", response_model=CashbackRuleResponse)
async def update_cashback_rule(
    rule_id: int,
    rule_data: CashbackRuleUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update cashback rule"""
    rule = db.query(CashbackRule).filter(
        CashbackRule.id == rule_id,
        CashbackRule.company_id == current_user.company_id
    ).first()
    
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    update_data = rule_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(rule, field, value)
    
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/rules/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cashback_rule(
    rule_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete cashback rule"""
    rule = db.query(CashbackRule).filter(
        CashbackRule.id == rule_id,
        CashbackRule.company_id == current_user.company_id
    ).first()
    
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    db.delete(rule)
    db.commit()
    return None


# ========== CASHBACK BALANCE ==========

@router.get("/balance/{client_id}", response_model=CashbackBalanceResponse)
async def get_cashback_balance(
    client_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get cashback balance for a client"""
    # Verify client exists and belongs to company
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.company_id == current_user.company_id
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    
    # Get or create balance
    balance = db.query(CashbackBalance).filter(
        CashbackBalance.client_id == client_id,
        CashbackBalance.company_id == current_user.company_id
    ).first()
    
    if not balance:
        balance = CashbackBalance(
            company_id=current_user.company_id,
            client_id=client_id,
            balance=Decimal(0)
        )
        db.add(balance)
        db.commit()
        db.refresh(balance)
    
    return balance


# ========== CASHBACK TRANSACTIONS ==========

@router.get("/transactions", response_model=List[CashbackTransactionResponse])
async def list_cashback_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    client_id: Optional[int] = None,
    transaction_type: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List cashback transactions"""
    query = db.query(CashbackTransaction).filter(
        CashbackTransaction.company_id == current_user.company_id
    )
    
    if client_id:
        balance = db.query(CashbackBalance).filter(
            CashbackBalance.client_id == client_id,
            CashbackBalance.company_id == current_user.company_id
        ).first()
        if balance:
            query = query.filter(CashbackTransaction.balance_id == balance.id)
        else:
            return []
    
    if transaction_type:
        query = query.filter(CashbackTransaction.transaction_type == transaction_type)
    
    transactions = query.order_by(CashbackTransaction.created_at.desc()).offset(skip).limit(limit).all()
    return transactions

