"""
Clients Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.dependencies import get_db_with_tenant
from app.core.rbac import get_current_user_context, CurrentUserContext
from app.core.security import require_manager
from app.core.cache import get_cache, set_cache, delete_pattern
from app.models.user import User
from app.models.client import Client
from app.schemas.client import (
    ClientCreate, ClientUpdate, ClientResponse, ClientHistory
)

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_client(
    client_data: ClientCreate,
    context: CurrentUserContext = Depends(get_current_user_context),
    db: Session = Depends(get_db_with_tenant)
):
    """Create a new client"""
    # Verify company access (defesa em profundidade)
    if client_data.company_id is not None and client_data.company_id != context.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Não autorizado a criar cliente nesta empresa"
        )
    
    # ✅ CORREÇÃO: Check if email already exists (if provided)
    if client_data.email:
        existing = db.query(Client).filter(
            Client.email == client_data.email,
            Client.company_id == context.company_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email {client_data.email} já cadastrado para outro cliente"
            )
    
    # ✅ CORREÇÃO: Check if phone already exists (if provided)
    if client_data.phone:
        existing_phone = db.query(Client).filter(
            Client.phone == client_data.phone,
            Client.company_id == context.company_id
        ).first()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Telefone {client_data.phone} já cadastrado para outro cliente"
            )

    client_dict = client_data.model_dump(exclude={'company_id'}, exclude_none=True)
    client = Client(**client_dict, company_id=context.company_id)
    db.add(client)
    db.commit()
    db.refresh(client)
    
    # Invalidate cache
    delete_pattern(f"clients:list:{context.company_id}:*")
    
    return ClientResponse.model_validate(client)


@router.get("", response_model=List[ClientResponse])
@router.get("/", response_model=List[ClientResponse], include_in_schema=False)
async def list_clients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    context: CurrentUserContext = Depends(get_current_user_context),
    db: Session = Depends(get_db_with_tenant)
):
    """List clients (Cached for 2 minutes)"""
    # Cache key
    cache_key = f"clients:list:{context.company_id}:{skip}:{limit}:{search}:{is_active}"
    
    # Try cache first (only for first page without search)
    if skip == 0 and not search:
        cached = await get_cache(cache_key)
        if cached:
            # ✅ CORREÇÃO: Retornar lista de ClientResponse do cache
            if all(isinstance(item, dict) and item.get("company_id") == context.company_id for item in cached):
                return [ClientResponse(**item) for item in cached]
    
    # Defesa em profundidade: filtrar explicitamente por company_id
    query = db.query(Client).filter(Client.company_id == context.company_id)
    
    # Search filter
    if search:
        search_filter = or_(
            Client.full_name.ilike(f"%{search}%"),
            Client.email.ilike(f"%{search}%"),
            Client.phone.ilike(f"%{search}%"),
            Client.cellphone.ilike(f"%{search}%"),
            Client.cpf.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Active filter
    if is_active is not None:
        query = query.filter(Client.is_active == is_active)
    
    clients = query.offset(skip).limit(limit).all()
    
    # Convert to Pydantic models
    result = [ClientResponse.model_validate(client) for client in clients]
    
    # ✅ CORREÇÃO: Cache usando model_dump para serialização correta
    # Cache result (only for first page without search)
    if skip == 0 and not search:
        cache_data = [r.model_dump() for r in result]
        await set_cache(cache_key, cache_data, ttl=120)  # 2 minutes
    
    return result


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: int,
    context: CurrentUserContext = Depends(get_current_user_context),
    db: Session = Depends(get_db_with_tenant)
):
    """Get client by ID"""
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.company_id == context.company_id
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    
    return ClientResponse.model_validate(client)


@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: int,
    client_data: ClientUpdate,
    context: CurrentUserContext = Depends(get_current_user_context),
    db: Session = Depends(get_db_with_tenant)
):
    """Update client"""
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.company_id == context.company_id
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    
    update_data = client_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(client, field, value)
    
    db.commit()
    db.refresh(client)
    
    # Invalidate cache
    delete_pattern(f"clients:list:{context.company_id}:*")
    
    return ClientResponse.model_validate(client)


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: int,
    context: CurrentUserContext = Depends(get_current_user_context),
    db: Session = Depends(get_db_with_tenant)
):
    """Delete client"""
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.company_id == context.company_id
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    
    db.delete(client)
    db.commit()
    
    # Invalidate cache
    delete_pattern(f"clients:list:{context.company_id}:*")
    
    return None


@router.get("/{client_id}/history", response_model=ClientHistory)
async def get_client_history(
    client_id: int,
    context: CurrentUserContext = Depends(get_current_user_context),
    db: Session = Depends(get_db_with_tenant)
):
    """Get complete client history"""
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.company_id == context.company_id
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    
    # Optimized: Use single query with UNION or multiple queries in parallel
    # For now, we'll optimize by limiting results and using select_related equivalent
    from app.models.appointment import Appointment
    from app.models.command import Command
    from app.models.package import Package
    from app.models.evaluation import Evaluation
    from app.models.anamnesis import Anamnesis
    from app.models.whatsapp_marketing import WhatsAppCampaignLog
    
    # Use limit to avoid loading too much data
    appointments = db.query(Appointment).filter(
        Appointment.client_crm_id == client_id,
        Appointment.company_id == context.company_id
    ).order_by(Appointment.start_time.desc()).limit(50).all()
    
    commands = db.query(Command).filter(
        Command.client_crm_id == client_id,
        Command.company_id == context.company_id
    ).order_by(Command.date.desc()).limit(50).all()
    
    packages = db.query(Package).filter(
        Package.client_crm_id == client_id,
        Package.company_id == context.company_id
    ).order_by(Package.created_at.desc()).limit(50).all()
    
    evaluations = db.query(Evaluation).filter(
        Evaluation.client_id == client_id,
        Evaluation.company_id == context.company_id
    ).order_by(Evaluation.created_at.desc()).limit(50).all()
    
    anamneses = db.query(Anamnesis).filter(
        Anamnesis.client_crm_id == client_id,
        Anamnesis.company_id == context.company_id
    ).order_by(Anamnesis.created_at.desc()).limit(50).all()
    
    whatsapp_messages = db.query(WhatsAppCampaignLog).filter(
        WhatsAppCampaignLog.client_crm_id == client_id,
        WhatsAppCampaignLog.company_id == context.company_id
    ).order_by(WhatsAppCampaignLog.sent_at.desc()).limit(50).all()
    
    return ClientHistory(
        appointments=[{"id": a.id, "date": a.start_time, "status": a.status.value} for a in appointments],
        commands=[{"id": c.id, "number": c.number, "date": c.date, "total": float(c.total_value)} for c in commands],
        packages=[{"id": p.id, "status": p.status.value, "expiry": p.expiry_date} for p in packages],
        evaluations=[{"id": e.id, "rating": e.rating, "date": e.created_at} for e in evaluations],
        anamneses=[{"id": a.id, "status": a.status, "date": a.created_at} for a in anamneses],
        whatsapp_messages=[{"id": m.id, "status": m.status.value, "sent_at": m.sent_at} for m in whatsapp_messages]
    )

