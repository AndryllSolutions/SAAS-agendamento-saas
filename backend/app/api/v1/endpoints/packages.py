"""
Packages Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.models.user import User
from app.models.package import PredefinedPackage, Package, PackageStatus
from app.models.client import Client
from app.schemas.package import (
    PredefinedPackageCreate, PredefinedPackageCreatePublic, PredefinedPackageUpdate, PredefinedPackageResponse,
    PackageCreate, PackageCreatePublic, PackageUpdate, PackageResponse,
    PackageUseSession
)  # PackageResponse now has from_model() method

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


# ========== PREDEFINED PACKAGES ==========

@router.post("/predefined", response_model=PredefinedPackageResponse, status_code=status.HTTP_201_CREATED)
async def create_predefined_package(
    package_data: PredefinedPackageCreatePublic,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Create a new predefined package (company_id auto-filled from auth)"""
    package = PredefinedPackage(**package_data.model_dump(), company_id=current_user.company_id)
    db.add(package)
    db.commit()
    db.refresh(package)
    return PredefinedPackageResponse.model_validate(package)


@router.get("/predefined", response_model=List[PredefinedPackageResponse])
async def list_predefined_packages(
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List predefined packages (Cached for 5 minutes)"""
    from app.core.cache import get_cache, set_cache
    
    # Cache key
    cache_key = f"packages:predefined:{current_user.company_id}:{is_active}"
    
    # Try cache first
    cached = await get_cache(cache_key)
    if cached:
        # ✅ CORREÇÃO: Retornar lista de PredefinedPackageResponse do cache
        return [PredefinedPackageResponse(**item) for item in cached]
    
    query = db.query(PredefinedPackage).filter(
        PredefinedPackage.company_id == current_user.company_id
    )
    
    if is_active is not None:
        query = query.filter(PredefinedPackage.is_active == is_active)
    
    packages = query.order_by(PredefinedPackage.name).all()
    
    # Convert to Pydantic models
    result = [PredefinedPackageResponse.model_validate(pkg) for pkg in packages]
    
    # ✅ CORREÇÃO: Cache usando model_dump para serialização correta
    # Cache result for 5 minutes
    cache_data = [r.model_dump() for r in result]
    await set_cache(cache_key, cache_data, ttl=300)
    
    return result


@router.get("/predefined/{package_id}", response_model=PredefinedPackageResponse)
async def get_predefined_package(
    package_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get predefined package by ID"""
    package = db.query(PredefinedPackage).filter(
        PredefinedPackage.id == package_id,
        PredefinedPackage.company_id == current_user.company_id
    ).first()
    
    if not package:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return PredefinedPackageResponse.model_validate(package)


@router.put("/predefined/{package_id}", response_model=PredefinedPackageResponse)
async def update_predefined_package(
    package_id: int,
    package_data: PredefinedPackageUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update predefined package"""
    package = db.query(PredefinedPackage).filter(
        PredefinedPackage.id == package_id,
        PredefinedPackage.company_id == current_user.company_id
    ).first()
    
    if not package:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    update_data = package_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(package, field, value)
    
    db.commit()
    db.refresh(package)
    return PredefinedPackageResponse.model_validate(package)


@router.delete("/predefined/{package_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_predefined_package(
    package_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete predefined package"""
    package = db.query(PredefinedPackage).filter(
        PredefinedPackage.id == package_id,
        PredefinedPackage.company_id == current_user.company_id
    ).first()
    
    if not package:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    db.delete(package)
    db.commit()
    return None


# ========== PACKAGES ==========

@router.post("", response_model=PackageResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=PackageResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_package(
    package_data: PackageCreatePublic,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Create a new package (sell package to client) - company_id auto-filled from auth"""
    
    # Verify client exists
    client = db.query(Client).filter(
        Client.id == package_data.client_id,
        Client.company_id == current_user.company_id
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    
    # Get predefined package
    predefined = db.query(PredefinedPackage).filter(
        PredefinedPackage.id == package_data.predefined_package_id,
        PredefinedPackage.company_id == current_user.company_id
    ).first()
    
    if not predefined:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pacote predefinido não encontrado"
        )
    
    # Calculate expiry date
    expiry_date = package_data.sale_date + timedelta(days=predefined.validity_days)
    
    # Create sessions balance from services included
    sessions_balance = {}
    for service_info in predefined.services_included:
        service_id = service_info.get("service_id")
        sessions = service_info.get("sessions", 0)
        sessions_balance[service_id] = sessions
    
    package = Package(
        company_id=current_user.company_id,
        client_crm_id=package_data.client_id,  # Fixed: Use client_crm_id (model field name)
        predefined_package_id=package_data.predefined_package_id,
        sale_date=package_data.sale_date,
        expiry_date=expiry_date,
        sessions_balance=sessions_balance,
        paid_value=package_data.paid_value,
        status=PackageStatus.ACTIVE
    )
    db.add(package)
    
    # Create financial transaction
    from app.models.financial import FinancialTransaction, TransactionType, TransactionOrigin, TransactionStatus
    transaction = FinancialTransaction(
        company_id=current_user.company_id,
        type=TransactionType.INCOME,
        origin=TransactionOrigin.MANUAL,
        value=package_data.paid_value,
        date=package_data.sale_date,
        description=f"Venda de pacote {predefined.name}",
        status=TransactionStatus.LIQUIDATED
    )
    db.add(transaction)
    
    db.commit()
    db.refresh(package)
    return PackageResponse.from_model(package)


@router.get("", response_model=List[PackageResponse])
@router.get("/", response_model=List[PackageResponse], include_in_schema=False)
async def list_packages(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    client_id: Optional[int] = None,
    status: Optional[PackageStatus] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List packages (Optimized with eager loading)"""
    from sqlalchemy.orm import joinedload
    
    # Optimized query with eager loading
    query = db.query(Package).options(
        joinedload(Package.client),
        joinedload(Package.predefined_package)
    ).filter(Package.company_id == current_user.company_id)
    
    if client_id:
        query = query.filter(Package.client_id == client_id)
    
    if status:
        query = query.filter(Package.status == status)
    
    packages = query.order_by(Package.sale_date.desc()).offset(skip).limit(limit).all()
    return [PackageResponse.from_model(pkg) for pkg in packages]


@router.get("/{package_id}", response_model=PackageResponse)
async def get_package(
    package_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get package by ID"""
    package = db.query(Package).filter(
        Package.id == package_id,
        Package.company_id == current_user.company_id
    ).first()
    
    if not package:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return PackageResponse.from_model(package)


@router.post("/{package_id}/use-session", response_model=PackageResponse)
async def use_package_session(
    package_id: int,
    session_data: PackageUseSession,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Use a package session"""
    package = db.query(Package).filter(
        Package.id == package_id,
        Package.company_id == current_user.company_id
    ).first()
    
    if not package:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    if package.status != PackageStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pacote não está ativo"
        )
    
    # Check if package expired
    if datetime.now() > package.expiry_date:
        package.status = PackageStatus.EXPIRED
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pacote expirado"
        )
    
    # Check if service has sessions available
    service_id_str = str(session_data.service_id)
    if service_id_str not in package.sessions_balance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Serviço não está incluído neste pacote"
        )
    
    remaining = package.sessions_balance[service_id_str]
    if remaining < session_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sessões insuficientes no pacote"
        )
    
    # Use sessions
    package.sessions_balance[service_id_str] = remaining - session_data.quantity
    
    # Check if package is exhausted
    total_remaining = sum(package.sessions_balance.values())
    if total_remaining == 0:
        package.status = PackageStatus.EXHAUSTED
    
    db.commit()
    db.refresh(package)
    return PackageResponse.from_model(package)


@router.put("/{package_id}", response_model=PackageResponse)
async def update_package(
    package_id: int,
    package_data: PackageUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update package"""
    package = db.query(Package).filter(
        Package.id == package_id,
        Package.company_id == current_user.company_id
    ).first()
    
    if not package:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    update_data = package_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(package, field, value)
    
    db.commit()
    db.refresh(package)
    return PackageResponse.from_model(package)

