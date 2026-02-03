"""
Professional endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.company import Company
from app.schemas.user import UserResponse, UserUpdate
from app.services.limit_validator import LimitValidator
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


async def _invalidate_professionals_list_cache(company_id: int) -> None:
    try:
        from app.core.cache import delete_pattern
        await delete_pattern(f"professionals:list:{company_id}:*")
    except Exception:
        return


@router.get("/public", response_model=List[UserResponse])
async def list_public_professionals(
    company_slug: str = Query(None, description="Company slug for filtering"),
    db: Session = Depends(get_db)
):
    """
    List active professionals for public booking (no authentication required)
    Supports filtering by company slug
    """
    # Get company by slug or default to first company
    if company_slug:
        company = db.query(Company).filter(Company.slug == company_slug).first()
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Empresa não encontrada"
            )
    else:
        # Fallback to first company for backward compatibility
        company = db.query(Company).first()
        if not company:
            return []
    
    # Get only active professionals
    professionals = db.query(User).filter(
        User.company_id == company.id,
        User.role.in_([UserRole.PROFESSIONAL, UserRole.OWNER, UserRole.MANAGER]),
        User.is_active == True
    ).all()
    
    return professionals


class ProfessionalCreate(BaseModel):
    """Schema for creating a professional"""
    email: EmailStr
    password: Optional[str] = Field(None, min_length=6, max_length=100, description="Optional - auto-generated if not provided")
    full_name: str = Field(..., min_length=3, max_length=255)
    phone: Optional[str] = None
    cpf_cnpj: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    specialties: Optional[List[str]] = None
    working_hours: Optional[Dict[str, Any]] = None
    notification_preferences: Optional[Dict[str, bool]] = None
    commission_rate: Optional[int] = Field(None, ge=0, le=100)
    send_invite_email: bool = Field(True, description="Send invitation email with credentials")


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_professional(
    professional_data: ProfessionalCreate,
    response: Response,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Create a new professional (Manager/Admin only)
    
    Validates plan limits before creating.
    Returns 402 Payment Required if limit is reached.
    """
    # Get company for limit validation
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    # Check for duplicate email
    existing_user = db.query(User).filter(
        User.email == professional_data.email,
        User.company_id == current_user.company_id
    ).first()
    
    if existing_user:
        # If exact same professional exists, return it (idempotent)
        if existing_user.role == UserRole.PROFESSIONAL:
            same = (
                existing_user.full_name == professional_data.full_name
                and (existing_user.phone or None) == professional_data.phone
                and int(existing_user.commission_rate or 0) == int(professional_data.commission_rate or 0)
            )
            if same:
                response.status_code = status.HTTP_200_OK
                return existing_user
        
        # Email already in use - provide helpful error message
        role_name = {
            UserRole.PROFESSIONAL: "profissional",
            UserRole.MANAGER: "gerente",
            UserRole.OWNER: "proprietário",
            UserRole.CLIENT: "cliente"
        }.get(existing_user.role, "usuário")
        
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"O email '{professional_data.email}' já está cadastrado como {role_name} nesta empresa. Use um email diferente."
        )

    # ✅ VALIDAÇÃO DE LIMITES DO PLANO
    can_add, limit_message = LimitValidator.check_professionals_limit(db, company)
    if not can_add:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=limit_message
        )
    
    # ✅ CORREÇÃO: Generate temporary password if not provided
    import secrets
    temp_password = None
    if not professional_data.password:
        temp_password = secrets.token_urlsafe(12)  # Generate secure random password
        password_to_use = temp_password
    else:
        password_to_use = professional_data.password
    
    # Create professional
    professional = User(
        company_id=current_user.company_id,
        email=professional_data.email,
        password_hash=get_password_hash(password_to_use),
        full_name=professional_data.full_name,
        phone=professional_data.phone,
        cpf_cnpj=professional_data.cpf_cnpj,
        role=UserRole.PROFESSIONAL,
        is_active=True,
        is_verified=False,
        avatar_url=professional_data.avatar_url,
        bio=professional_data.bio,
        date_of_birth=professional_data.date_of_birth,
        gender=professional_data.gender,
        address=professional_data.address,
        city=professional_data.city,
        state=professional_data.state,
        postal_code=professional_data.postal_code,
        specialties=professional_data.specialties,
        working_hours=professional_data.working_hours,
        notification_preferences=professional_data.notification_preferences,
        commission_rate=professional_data.commission_rate or 0
    )
    
    db.add(professional)
    db.commit()
    db.refresh(professional)

    await _invalidate_professionals_list_cache(current_user.company_id)
    
    # ✅ CORREÇÃO: Send invitation email if requested and password was auto-generated
    if professional_data.send_invite_email and temp_password:
        try:
            # Get company info
            company = db.query(Company).filter(
                Company.id == current_user.company_id
            ).first()
            
            # TODO: Implement email sending service
            # For now, just log the credentials
            print(f"""
            ========================================
            🎉 Novo Profissional Cadastrado!
            ========================================
            Nome: {professional.full_name}
            Email: {professional.email}
            Senha Temporária: {temp_password}
            Empresa: {company.name if company else 'N/A'}
            ========================================
            
            ⚠️ IMPORTANTE: Implemente o serviço de email para enviar automaticamente!
            
            Email template:
            ---
            Olá {professional.full_name}!
            
            Você foi cadastrado como profissional em {company.name if company else 'nossa empresa'}!
            
            Acesse o sistema com suas credenciais:
            Email: {professional.email}
            Senha: {temp_password}
            
            Por segurança, altere sua senha no primeiro acesso.
            
            Link: {settings.FRONTEND_URL}/login
            ---
            """)
        except Exception as e:
            # Don't fail professional creation if email fails
            print(f"Warning: Failed to send invitation email: {e}")
    
    return professional


@router.get("", response_model=List[UserResponse])
async def list_professionals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List all professionals from the same company (Cached for 5 minutes)
    """
    from app.core.cache import get_cache, set_cache
    
    # Cache key
    cache_key = f"professionals:list:{current_user.company_id}:{skip}:{limit}:{search}:{is_active}"
    
    # Try cache first (only for first page without search)
    if skip == 0 and not search:
        cached = await get_cache(cache_key)
        if cached:
            # ✅ CORREÇÃO: Retornar lista de UserResponse do cache
            return [UserResponse(**item) for item in cached]
    
    # Optimized query using composite index
    query = db.query(User).filter(
        User.company_id == current_user.company_id,
        User.role == UserRole.PROFESSIONAL
    )
    
    if search:
        query = query.filter(
            or_(
                User.full_name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%")
            )
        )
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    professionals = query.order_by(User.full_name).offset(skip).limit(limit).all()
    
    # Convert to Pydantic models for proper serialization
    result = [UserResponse.model_validate(p) for p in professionals]
    
    # ✅ CORREÇÃO: Cache usando model_dump para serialização correta
    # Cache result (only for first page without search)
    if skip == 0 and not search:
        cache_data = [r.model_dump() for r in result]
        await set_cache(cache_key, cache_data, ttl=300)  # 5 minutes
    
    return result


@router.get("/{professional_id}", response_model=UserResponse)
async def get_professional(
    professional_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get professional by ID
    """
    professional = db.query(User).filter(
        User.id == professional_id,
        User.company_id == current_user.company_id,
        User.role == UserRole.PROFESSIONAL
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profissional não encontrado"
        )
    
    return professional


@router.put("/{professional_id}", response_model=UserResponse)
async def update_professional(
    professional_id: int,
    professional_data: UserUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Update professional (Manager/Admin only)
    """
    professional = db.query(User).filter(
        User.id == professional_id,
        User.company_id == current_user.company_id,
        User.role == UserRole.PROFESSIONAL
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profissional não encontrado"
        )
    
    update_data = professional_data.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(professional, field, value)
    
    db.commit()
    db.refresh(professional)

    await _invalidate_professionals_list_cache(current_user.company_id)
    
    return professional


@router.delete("/{professional_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_professional(
    professional_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Delete professional (soft delete - Manager/Admin only)
    """
    professional = db.query(User).filter(
        User.id == professional_id,
        User.company_id == current_user.company_id,
        User.role == UserRole.PROFESSIONAL
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profissional não encontrado"
        )
    
    # Soft delete - just deactivate
    professional.is_active = False
    db.commit()

    await _invalidate_professionals_list_cache(current_user.company_id)
    
    return None


@router.get("/{professional_id}/schedule", response_model=dict)
async def get_professional_schedule(
    professional_id: int,
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get professional schedule/appointments
    """
    from app.models.appointment import Appointment
    from datetime import datetime
    
    professional = db.query(User).filter(
        User.id == professional_id,
        User.company_id == current_user.company_id,
        User.role == UserRole.PROFESSIONAL
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profissional não encontrado"
        )
    
    query = db.query(Appointment).filter(
        Appointment.professional_id == professional_id,
        Appointment.company_id == current_user.company_id
    )
    
    if start_date:
        query = query.filter(Appointment.start_time >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(Appointment.start_time <= datetime.fromisoformat(end_date))
    
    appointments = query.order_by(Appointment.start_time).all()
    
    return {
        "professional": {
            "id": professional.id,
            "name": professional.full_name,
            "working_hours": professional.working_hours
        },
        "appointments": [
            {
                "id": apt.id,
                "start_time": apt.start_time.isoformat(),
                "end_time": apt.end_time.isoformat() if apt.end_time else None,
                "client_name": apt.client.full_name if apt.client else None,
                "service_name": apt.service.name if apt.service else None,
                "status": apt.status.value if apt.status else None
            }
            for apt in appointments
        ]
    }


@router.get("/{professional_id}/statistics", response_model=dict)
async def get_professional_statistics(
    professional_id: int,
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get professional statistics (Cached for 5 minutes)
    """
    from app.models.appointment import Appointment
    from app.models.commission import Commission
    from app.models.command import Command
    from app.models.evaluation import Evaluation
    from datetime import datetime
    from sqlalchemy import func
    from app.core.cache import get_cache, set_cache
    
    # Cache key
    cache_key = f"professional:stats:{professional_id}:{start_date}:{end_date}"
    
    # Try cache first
    cached = await get_cache(cache_key)
    if cached:
        return cached
    
    professional = db.query(User).filter(
        User.id == professional_id,
        User.company_id == current_user.company_id,
        User.role == UserRole.PROFESSIONAL
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profissional não encontrado"
        )
    
    # Base query filters (optimized with indexes)
    base_filter = [
        Appointment.professional_id == professional_id,
        Appointment.company_id == current_user.company_id
    ]
    
    if start_date:
        base_filter.append(Appointment.start_time >= datetime.fromisoformat(start_date))
    if end_date:
        base_filter.append(Appointment.start_time <= datetime.fromisoformat(end_date))
    
    # Total appointments (optimized with index)
    total_appointments = db.query(func.count(Appointment.id)).filter(*base_filter).scalar() or 0
    
    # Completed appointments (optimized with index)
    completed_appointments = db.query(func.count(Appointment.id)).filter(
        *base_filter,
        Appointment.status == "completed"
    ).scalar() or 0
    
    # Total commissions (optimized with index)
    commission_filter = [
        Commission.professional_id == professional_id,
        Commission.company_id == current_user.company_id
    ]
    if start_date:
        commission_filter.append(Commission.created_at >= datetime.fromisoformat(start_date))
    if end_date:
        commission_filter.append(Commission.created_at <= datetime.fromisoformat(end_date))
    
    total_commissions = db.query(func.sum(Commission.commission_value)).filter(
        *commission_filter,
        Commission.status == "paid"
    ).scalar() or 0
    
    # Total revenue from commands (optimized with index)
    command_filter = [
        Command.professional_id == professional_id,
        Command.company_id == current_user.company_id,
        Command.status == "finished"
    ]
    if start_date:
        command_filter.append(Command.date >= datetime.fromisoformat(start_date))
    if end_date:
        command_filter.append(Command.date <= datetime.fromisoformat(end_date))
    
    total_revenue = db.query(func.sum(Command.net_value)).filter(*command_filter).scalar() or 0
    
    # Average rating from evaluations (optimized with index)
    avg_rating = db.query(func.avg(Evaluation.rating)).filter(
        Evaluation.professional_id == professional_id,
        Evaluation.company_id == current_user.company_id
    ).scalar() or 0.0
    
    result = {
        "professional_id": professional.id,
        "professional_name": professional.full_name,
        "total_appointments": total_appointments,
        "completed_appointments": completed_appointments,
        "cancelled_appointments": total_appointments - completed_appointments,
        "total_commissions": float(total_commissions),
        "total_revenue": float(total_revenue),
        "average_rating": float(avg_rating),
        "period": {
            "start_date": start_date,
            "end_date": end_date
        }
    }
    
    # Cache result for 5 minutes
    await set_cache(cache_key, result, ttl=300)
    
    return result


# Reorder endpoint
class ReorderItem(BaseModel):
    id: int
    sort_order: int


class ReorderRequest(BaseModel):
    items: List[ReorderItem]


@router.post("/reorder")
async def reorder_professionals(
    reorder_data: ReorderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Reorder professionals by updating sort_order
    """
    # Get all professionals in user's company
    professionals = db.query(User).filter(
        and_(
            User.company_id == current_user.company_id,
            User.role.in_([UserRole.PROFESSIONAL, UserRole.EMPLOYEE])
        )
    ).all()
    
    # Validate all items belong to user's company
    professional_ids = {item.id for item in reorder_data.items}
    db_ids = {p.id for p in professionals}
    
    if not professional_ids.issubset(db_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid professional IDs"
        )
    
    # Update sort order
    for item in reorder_data.items:
        professional = next((p for p in professionals if p.id == item.id), None)
        if professional:
            professional.sort_order = item.sort_order
    
    db.commit()
    
    # Invalidate cache
    await _invalidate_professionals_list_cache(current_user.company_id)
    
    return {"message": "Professionals reordered successfully"}
