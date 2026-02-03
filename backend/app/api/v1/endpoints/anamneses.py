"""
Anamneses Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.models.user import User
from app.models.anamnesis import AnamnesisModel, Anamnesis, AnamnesisStatus
from app.models.client import Client
from app.schemas.anamnesis import (
    AnamnesisModelCreate, AnamnesisModelUpdate, AnamnesisModelResponse,
    AnamnesisCreate, AnamnesisUpdate, AnamnesisResponse,
    AnamnesisSign
)

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


# ========== ANAMNESIS MODELS ==========

@router.post("/models", response_model=AnamnesisModelResponse, status_code=status.HTTP_201_CREATED)
async def create_anamnesis_model(
    model_data: AnamnesisModelCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Create a new anamnesis model"""
    if model_data.company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    model = AnamnesisModel(**model_data.dict())
    db.add(model)
    db.commit()
    db.refresh(model)
    return AnamnesisModelResponse.model_validate(model)


@router.get("/models", response_model=List[AnamnesisModelResponse])
async def list_anamnesis_models(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List anamnesis models"""
    models = db.query(AnamnesisModel).filter(
        AnamnesisModel.company_id == current_user.company_id
    ).all()
    return [AnamnesisModelResponse.model_validate(m) for m in models]


@router.get("/models/{model_id}", response_model=AnamnesisModelResponse)
async def get_anamnesis_model(
    model_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get anamnesis model by ID"""
    model = db.query(AnamnesisModel).filter(
        AnamnesisModel.id == model_id,
        AnamnesisModel.company_id == current_user.company_id
    ).first()
    
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return AnamnesisModelResponse.model_validate(model)


@router.put("/models/{model_id}", response_model=AnamnesisModelResponse)
async def update_anamnesis_model(
    model_id: int,
    model_data: AnamnesisModelUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update anamnesis model"""
    model = db.query(AnamnesisModel).filter(
        AnamnesisModel.id == model_id,
        AnamnesisModel.company_id == current_user.company_id
    ).first()
    
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    update_data = model_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(model, field, value)
    
    db.commit()
    db.refresh(model)
    return model


@router.delete("/models/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_anamnesis_model(
    model_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete anamnesis model"""
    model = db.query(AnamnesisModel).filter(
        AnamnesisModel.id == model_id,
        AnamnesisModel.company_id == current_user.company_id
    ).first()
    
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    db.delete(model)
    db.commit()
    return None


# ========== ANAMNESES ==========

@router.post("", response_model=AnamnesisResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=AnamnesisResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_anamnesis(
    anamnesis_data: AnamnesisCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new anamnesis"""
    if anamnesis_data.company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    # Verify client exists
    client = db.query(Client).filter(
        Client.id == anamnesis_data.client_id,
        Client.company_id == current_user.company_id
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    
    # Verify model exists
    model = db.query(AnamnesisModel).filter(
        AnamnesisModel.id == anamnesis_data.model_id,
        AnamnesisModel.company_id == current_user.company_id
    ).first()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Modelo de anamnese não encontrado"
        )
    
    anamnesis = Anamnesis(
        company_id=current_user.company_id,
        client_id=anamnesis_data.client_id,
        professional_id=anamnesis_data.professional_id or current_user.id,
        model_id=anamnesis_data.model_id,
        responses=anamnesis_data.responses,
        status=AnamnesisStatus.OPEN
    )
    db.add(anamnesis)
    db.commit()
    db.refresh(anamnesis)
    return AnamnesisResponse.model_validate(anamnesis)


@router.get("", response_model=List[AnamnesisResponse])
@router.get("/", response_model=List[AnamnesisResponse], include_in_schema=False)
async def list_anamneses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    client_id: Optional[int] = None,
    professional_id: Optional[int] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List anamneses"""
    query = db.query(Anamnesis).filter(Anamnesis.company_id == current_user.company_id)
    
    if client_id:
        query = query.filter(Anamnesis.client_id == client_id)
    
    if professional_id:
        query = query.filter(Anamnesis.professional_id == professional_id)
    
    if status:
        query = query.filter(Anamnesis.status == status)
    
    anamneses = query.order_by(Anamnesis.created_at.desc()).offset(skip).limit(limit).all()
    return [AnamnesisResponse.model_validate(a) for a in anamneses]


@router.get("/{anamnesis_id}", response_model=AnamnesisResponse)
async def get_anamnesis(
    anamnesis_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get anamnesis by ID"""
    anamnesis = db.query(Anamnesis).filter(
        Anamnesis.id == anamnesis_id,
        Anamnesis.company_id == current_user.company_id
    ).first()
    
    if not anamnesis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return anamnesis


@router.put("/{anamnesis_id}", response_model=AnamnesisResponse)
async def update_anamnesis(
    anamnesis_id: int,
    anamnesis_data: AnamnesisUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update anamnesis"""
    anamnesis = db.query(Anamnesis).filter(
        Anamnesis.id == anamnesis_id,
        Anamnesis.company_id == current_user.company_id
    ).first()
    
    if not anamnesis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    if anamnesis.is_signed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Anamnese assinada não pode ser alterada"
        )
    
    update_data = anamnesis_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(anamnesis, field, value)
    
    db.commit()
    db.refresh(anamnesis)
    return AnamnesisResponse.model_validate(anamnesis)


@router.post("/{anamnesis_id}/sign", response_model=AnamnesisResponse)
async def sign_anamnesis(
    anamnesis_id: int,
    sign_data: AnamnesisSign,
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Sign anamnesis"""
    anamnesis = db.query(Anamnesis).filter(
        Anamnesis.id == anamnesis_id,
        Anamnesis.company_id == current_user.company_id
    ).first()
    
    if not anamnesis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    if anamnesis.is_signed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Anamnese já está assinada"
        )
    
    # Get client IP
    client_ip = request.client.host if request.client else None
    
    anamnesis.is_signed = True
    anamnesis.signature_date = datetime.now()
    anamnesis.signature_image_url = sign_data.signature_image_url
    anamnesis.signature_name = sign_data.signature_name
    anamnesis.signature_ip = sign_data.signature_ip or client_ip
    anamnesis.status = AnamnesisStatus.CLOSED
    
    db.commit()
    db.refresh(anamnesis)
    return AnamnesisResponse.model_validate(anamnesis)


@router.delete("/{anamnesis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_anamnesis(
    anamnesis_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete anamnesis"""
    anamnesis = db.query(Anamnesis).filter(
        Anamnesis.id == anamnesis_id,
        Anamnesis.company_id == current_user.company_id
    ).first()
    
    if not anamnesis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    db.delete(anamnesis)
    db.commit()
    return None

