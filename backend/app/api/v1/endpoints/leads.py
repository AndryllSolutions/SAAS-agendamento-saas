from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.dependencies import get_db_with_tenant, get_db_with_api_key_tenant_context
from app.core.rbac import get_current_user_context, CurrentUserContext
from app.models.api_key import APIKey
from app.models.company import Company
from app.models.lead import Lead
from app.models.client import Client
from app.schemas.lead import LeadCreate, LeadUpdate, LeadResponse


router = APIRouter(
    redirect_slashes=False
)


@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=LeadResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_lead(
    payload: LeadCreate,
    context: CurrentUserContext = Depends(get_current_user_context),
    db: Session = Depends(get_db_with_tenant)
):
    lead_data = payload.model_dump(exclude_none=True)

    # Simple dedup (defense): if same whatsapp/email/phone exists and not converted, update it
    existing = None
    if payload.whatsapp:
        existing = db.query(Lead).filter(
            Lead.company_id == context.company_id,
            Lead.whatsapp == payload.whatsapp,
            Lead.is_converted.is_(False)
        ).first()

    if not existing and payload.email:
        existing = db.query(Lead).filter(
            Lead.company_id == context.company_id,
            Lead.email == payload.email,
            Lead.is_converted.is_(False)
        ).first()

    if not existing and payload.phone:
        existing = db.query(Lead).filter(
            Lead.company_id == context.company_id,
            Lead.phone == payload.phone,
            Lead.is_converted.is_(False)
        ).first()

    if existing:
        for k, v in lead_data.items():
            setattr(existing, k, v)
        existing.created_by_user_id = context.user_id
        db.commit()
        db.refresh(existing)
        return LeadResponse.model_validate(existing)

    lead = Lead(
        **lead_data,
        company_id=context.company_id,
        created_by_user_id=context.user_id,
        status=payload.status or "new",
        stage=payload.stage or "inbox",
        is_converted=False,
    )

    db.add(lead)
    db.commit()
    db.refresh(lead)
    return LeadResponse.model_validate(lead)


@router.get("", response_model=List[LeadResponse])
@router.get("/", response_model=List[LeadResponse], include_in_schema=False)
async def list_leads(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    stage: Optional[str] = None,
    is_converted: Optional[bool] = None,
    context: CurrentUserContext = Depends(get_current_user_context),
    db: Session = Depends(get_db_with_tenant)
):
    query = db.query(Lead).filter(Lead.company_id == context.company_id)

    if search:
        query = query.filter(or_(
            Lead.full_name.ilike(f"%{search}%"),
            Lead.email.ilike(f"%{search}%"),
            Lead.phone.ilike(f"%{search}%"),
            Lead.whatsapp.ilike(f"%{search}%"),
            Lead.wa_chat_title.ilike(f"%{search}%"),
        ))

    if status_filter:
        query = query.filter(Lead.status == status_filter)

    if stage:
        query = query.filter(Lead.stage == stage)

    if is_converted is not None:
        query = query.filter(Lead.is_converted == is_converted)

    leads = query.order_by(Lead.created_at.desc()).offset(skip).limit(limit).all()
    return [LeadResponse.model_validate(l) for l in leads]


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: int,
    context: CurrentUserContext = Depends(get_current_user_context),
    db: Session = Depends(get_db_with_tenant)
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id,
        Lead.company_id == context.company_id
    ).first()

    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead não encontrado")

    return LeadResponse.model_validate(lead)


@router.patch("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: int,
    payload: LeadUpdate,
    context: CurrentUserContext = Depends(get_current_user_context),
    db: Session = Depends(get_db_with_tenant)
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id,
        Lead.company_id == context.company_id
    ).first()

    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead não encontrado")

    update_data = payload.model_dump(exclude_unset=True, exclude_none=False)
    for k, v in update_data.items():
        setattr(lead, k, v)

    db.commit()
    db.refresh(lead)
    return LeadResponse.model_validate(lead)


@router.post("/{lead_id}/convert", response_model=LeadResponse)
async def convert_lead_to_client(
    lead_id: int,
    context: CurrentUserContext = Depends(get_current_user_context),
    db: Session = Depends(get_db_with_tenant)
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id,
        Lead.company_id == context.company_id
    ).first()

    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead não encontrado")

    if lead.is_converted:
        return LeadResponse.model_validate(lead)

    client = None
    if lead.email:
        client = db.query(Client).filter(
            Client.company_id == context.company_id,
            Client.email == lead.email
        ).first()

    if not client and lead.phone:
        client = db.query(Client).filter(
            Client.company_id == context.company_id,
            Client.phone == lead.phone
        ).first()

    if not client and lead.whatsapp:
        client = db.query(Client).filter(
            Client.company_id == context.company_id,
            Client.cellphone == lead.whatsapp
        ).first()

    if not client:
        client = Client(
            company_id=context.company_id,
            full_name=lead.full_name,
            email=lead.email,
            phone=lead.phone,
            cellphone=lead.whatsapp,
            notes=lead.notes,
            marketing_whatsapp=True if lead.whatsapp else False,
            marketing_email=True if lead.email else False,
            is_active=True,
            credits=0,
        )
        db.add(client)
        db.flush()

    lead.is_converted = True
    lead.converted_client_id = client.id
    lead.status = "converted"

    db.commit()
    db.refresh(lead)
    return LeadResponse.model_validate(lead)


@router.post(
    "/capture/whatsapp-web",
    response_model=LeadResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Leads - Capture"]
)
async def capture_whatsapp_web_lead(
    request: Request,
    payload: LeadCreate,
    ctx: tuple[Session, APIKey, Company] = Depends(get_db_with_api_key_tenant_context("leads:write"))
):
    db, api_key, company = ctx

    lead_data = payload.model_dump(exclude_none=True)

    existing = None
    if payload.whatsapp:
        existing = db.query(Lead).filter(
            Lead.company_id == company.id,
            Lead.whatsapp == payload.whatsapp,
            Lead.is_converted.is_(False)
        ).first()

    if existing:
        for k, v in lead_data.items():
            setattr(existing, k, v)
        existing.created_by_user_id = api_key.user_id
        existing.source = existing.source or "whatsapp_web"
        existing.stage = existing.stage or "inbox"
        existing.status = existing.status or "new"
        db.commit()
        db.refresh(existing)
        return LeadResponse.model_validate(existing)

    lead = Lead(
        **lead_data,
        company_id=company.id,
        created_by_user_id=api_key.user_id,
        source=payload.source or "whatsapp_web",
        stage=payload.stage or "inbox",
        status=payload.status or "new",
        is_converted=False,
    )

    db.add(lead)
    db.commit()
    db.refresh(lead)

    return LeadResponse.model_validate(lead)
