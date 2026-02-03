"""
Suppliers Endpoints - Dedicated route for Cadastros module
This is an alias/wrapper for the suppliers endpoints in purchases.py
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.models.user import User
from app.models.purchase import Supplier
from app.schemas.purchase import (
    SupplierCreate, SupplierCreatePublic, SupplierUpdate, SupplierResponse
)

router = APIRouter(
    redirect_slashes=False
)


@router.post("", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_supplier(
    supplier_data: SupplierCreatePublic,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Create a new supplier"""
    supplier_dict = supplier_data.dict()
    supplier_dict['company_id'] = current_user.company_id
    
    supplier = Supplier(**supplier_dict)
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier


@router.get("", response_model=List[SupplierResponse])
@router.get("/", response_model=List[SupplierResponse], include_in_schema=False)
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


@router.get("/{supplier_id}", response_model=SupplierResponse)
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


@router.put("/{supplier_id}", response_model=SupplierResponse)
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


@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
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
