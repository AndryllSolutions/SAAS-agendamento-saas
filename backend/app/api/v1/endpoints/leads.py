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
from app.utils.whatsapp_sanitizer import sanitize_lead_data, validate_lead_data

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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead nao encontrado")

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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead nao encontrado")

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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead nao encontrado")

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
    context: CurrentUserContext = Depends(get_current_user_context),
    db: Session = Depends(get_db_with_tenant)
):
    """
    Captura um lead do WhatsApp Web via extensao do Chrome.
    
    A extensao envia dados brutos que podem estar em diferentes formatos.
    Este endpoint sanitiza e valida os dados antes de salvar.
    
    Estrategia de sanitizacao:
    1. Remove caracteres especiais de numeros de telefone
    2. Tenta extrair numero de multiplas fontes (whatsapp, wa_url, phone, nome)
    3. Valida dados minimos (nome + telefone)
    4. Evita duplicatas por numero de WhatsApp
    """
    company_id = context.company_id

    # Sanitiza dados da extensao
    clean_name, clean_phone, _ = sanitize_lead_data(
        full_name=payload.full_name,
        phone=payload.phone,
        whatsapp=payload.whatsapp,
        wa_url=payload.wa_url,
        email=payload.email,
    )

    # Valida dados minimos
    is_valid, error_msg = validate_lead_data(clean_name, clean_phone)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Dados invalidos: {error_msg}. Verifique se o nome e numero de telefone foram capturados corretamente."
        )

    # Tenta encontrar lead existente por numero de WhatsApp
    existing = None
    if clean_phone:
        existing = db.query(Lead).filter(
            Lead.company_id == company_id,
            Lead.whatsapp == clean_phone,
            Lead.is_converted.is_(False)
        ).first()

    # Se nao encontrou por WhatsApp, tenta por email
    if not existing and payload.email:
        existing = db.query(Lead).filter(
            Lead.company_id == company_id,
            Lead.email == payload.email,
            Lead.is_converted.is_(False)
        ).first()

    if existing:
        # Atualiza lead existente com novos dados
        existing.full_name = clean_name or existing.full_name
        existing.whatsapp = clean_phone or existing.whatsapp
        existing.email = payload.email or existing.email
        existing.phone = payload.phone or existing.phone
        existing.wa_chat_title = payload.wa_chat_title or existing.wa_chat_title
        existing.wa_last_message = payload.wa_last_message or existing.wa_last_message
        existing.wa_url = payload.wa_url or existing.wa_url
        existing.image_url = payload.image_url or existing.image_url
        existing.notes = payload.notes or existing.notes
        existing.created_by_user_id = context.user_id
        existing.source = existing.source or "whatsapp_web"
        existing.stage = existing.stage or "inbox"
        existing.status = existing.status or "new"
        db.commit()
        db.refresh(existing)
        return LeadResponse.model_validate(existing)

    # Cria novo lead com dados sanitizados
    lead = Lead(
        company_id=company_id,
        created_by_user_id=context.user_id,
        full_name=clean_name,
        email=payload.email,
        phone=payload.phone,
        whatsapp=clean_phone,
        source=payload.source or "whatsapp_web",
        stage=payload.stage or "inbox",
        status=payload.status or "new",
        notes=payload.notes,
        wa_chat_title=payload.wa_chat_title,
        wa_last_message=payload.wa_last_message,
        wa_url=payload.wa_url,
        image_url=payload.image_url,
        raw_payload=payload.raw_payload,
        is_converted=False,
    )

    db.add(lead)
    db.commit()
    db.refresh(lead)

    return LeadResponse.model_validate(lead)
