"""
Purchases and Suppliers Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.models.user import User
from app.models.purchase import Supplier, Purchase, PurchaseItem, PurchaseStatus
from app.models.product import Product
from app.schemas.purchase import (
    SupplierCreate, SupplierUpdate, SupplierResponse,
    PurchaseCreate, PurchaseCreatePublic, PurchaseUpdate, PurchaseResponse,
    PurchaseItemResponse
)

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


# ========== SUPPLIERS ==========

@router.post("/suppliers", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
async def create_supplier(
    supplier_data: SupplierCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Create a new supplier"""
    if supplier_data.company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    supplier = Supplier(**supplier_data.dict())
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier


@router.get("/suppliers", response_model=List[SupplierResponse])
async def list_suppliers(
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List suppliers"""
    query = db.query(Supplier).filter(Supplier.company_id == current_user.company_id)
    
    if search:
        from sqlalchemy import or_
        query = query.filter(
            or_(
                Supplier.name.ilike(f"%{search}%"),
                Supplier.email.ilike(f"%{search}%"),
                Supplier.cnpj.ilike(f"%{search}%")
            )
        )
    
    suppliers = query.all()
    return suppliers


@router.get("/suppliers/{supplier_id}", response_model=SupplierResponse)
async def get_supplier(
    supplier_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get supplier by ID"""
    supplier = db.query(Supplier).filter(
        Supplier.id == supplier_id,
        Supplier.company_id == current_user.company_id
    ).first()
    
    if not supplier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return supplier


@router.put("/suppliers/{supplier_id}", response_model=SupplierResponse)
async def update_supplier(
    supplier_id: int,
    supplier_data: SupplierUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update supplier"""
    supplier = db.query(Supplier).filter(
        Supplier.id == supplier_id,
        Supplier.company_id == current_user.company_id
    ).first()
    
    if not supplier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    update_data = supplier_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(supplier, field, value)
    
    db.commit()
    db.refresh(supplier)
    return supplier


@router.delete("/suppliers/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_supplier(
    supplier_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete supplier"""
    supplier = db.query(Supplier).filter(
        Supplier.id == supplier_id,
        Supplier.company_id == current_user.company_id
    ).first()
    
    if not supplier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    db.delete(supplier)
    db.commit()
    return None


# ========== PURCHASES ==========

def generate_purchase_number(company_id: int, db: Session) -> str:
    """Generate unique purchase number"""
    today = datetime.now().date()
    count = db.query(Purchase).filter(
        Purchase.company_id == company_id,
        Purchase.created_at >= datetime.combine(today, datetime.min.time())
    ).count()
    
    return f"COMP-{today.strftime('%Y%m%d')}-{count + 1:04d}"


@router.post("", response_model=PurchaseResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=PurchaseResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_purchase(
    purchase_data: PurchaseCreatePublic,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Create a new purchase (company_id auto-filled from auth)"""
    
    # Verify supplier exists
    supplier = db.query(Supplier).filter(
        Supplier.id == purchase_data.supplier_id,
        Supplier.company_id == current_user.company_id
    ).first()
    
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fornecedor não encontrado"
        )
    
    # Generate purchase number
    purchase_number = generate_purchase_number(current_user.company_id, db)
    
    # Calculate total from items
    total_value = sum(item.total_cost for item in purchase_data.items)
    
    # Create purchase
    purchase = Purchase(
        company_id=current_user.company_id,
        supplier_id=purchase_data.supplier_id,
        number=purchase_number,
        purchase_date=purchase_data.purchase_date,
        total_value=total_value,
        payment_method=purchase_data.payment_method,
        notes=purchase_data.notes,
        status=PurchaseStatus.OPEN
    )
    db.add(purchase)
    db.flush()
    
    # Add items and update stock
    for item_data in purchase_data.items:
        # Verify product exists
        product = db.query(Product).filter(
            Product.id == item_data.product_id,
            Product.company_id == current_user.company_id
        ).first()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Produto {item_data.product_id} não encontrado"
            )
        
        item = PurchaseItem(
            purchase_id=purchase.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            unit_cost=item_data.unit_cost,
            total_cost=item_data.total_cost
        )
        db.add(item)
        
        # Update product stock
        product.stock_current += item_data.quantity
    
    db.commit()
    db.refresh(purchase)
    return purchase


@router.get("", response_model=List[PurchaseResponse])
@router.get("/", response_model=List[PurchaseResponse], include_in_schema=False)
async def list_purchases(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    supplier_id: Optional[int] = None,
    status: Optional[PurchaseStatus] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List purchases"""
    query = db.query(Purchase).filter(Purchase.company_id == current_user.company_id)
    
    if supplier_id:
        query = query.filter(Purchase.supplier_id == supplier_id)
    
    if status:
        query = query.filter(Purchase.status == status)
    
    purchases = query.order_by(Purchase.purchase_date.desc()).offset(skip).limit(limit).all()
    return purchases


@router.get("/{purchase_id}", response_model=PurchaseResponse)
async def get_purchase(
    purchase_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get purchase by ID"""
    purchase = db.query(Purchase).filter(
        Purchase.id == purchase_id,
        Purchase.company_id == current_user.company_id
    ).first()
    
    if not purchase:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return purchase


@router.put("/{purchase_id}", response_model=PurchaseResponse)
async def update_purchase(
    purchase_id: int,
    purchase_data: PurchaseUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update purchase"""
    purchase = db.query(Purchase).filter(
        Purchase.id == purchase_id,
        Purchase.company_id == current_user.company_id
    ).first()
    
    if not purchase:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    if purchase.status == PurchaseStatus.FINISHED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Compra finalizada não pode ser alterada"
        )
    
    update_data = purchase_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(purchase, field, value)
    
    db.commit()
    db.refresh(purchase)
    return purchase


@router.post("/{purchase_id}/finish", response_model=PurchaseResponse)
async def finish_purchase(
    purchase_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Finish purchase and create financial transaction"""
    purchase = db.query(Purchase).filter(
        Purchase.id == purchase_id,
        Purchase.company_id == current_user.company_id
    ).first()
    
    if not purchase:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    if purchase.status == PurchaseStatus.FINISHED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Compra já está finalizada"
        )
    
    purchase.status = PurchaseStatus.FINISHED
    
    # Create financial transaction
    from app.models.financial import FinancialTransaction, TransactionType, TransactionOrigin, TransactionStatus
    transaction = FinancialTransaction(
        company_id=current_user.company_id,
        type=TransactionType.EXPENSE,
        origin=TransactionOrigin.PURCHASE,
        purchase_id=purchase.id,
        value=purchase.total_value,
        date=purchase.purchase_date,
        description=f"Compra {purchase.number}",
        status=TransactionStatus.LIQUIDATED
    )
    db.add(transaction)
    
    db.commit()
    db.refresh(purchase)
    return purchase


@router.delete("/{purchase_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_purchase(
    purchase_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete purchase"""
    purchase = db.query(Purchase).filter(
        Purchase.id == purchase_id,
        Purchase.company_id == current_user.company_id
    ).first()
    
    if not purchase:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    if purchase.status == PurchaseStatus.FINISHED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Compra finalizada não pode ser deletada"
        )
    
    # Revert stock changes
    for item in purchase.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.stock_current -= item.quantity
    
    db.delete(purchase)
    db.commit()
    return None

