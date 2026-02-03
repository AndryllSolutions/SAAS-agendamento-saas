"""
Users Endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager, get_password_hash
from app.core.plan_middleware import check_plan_limit
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, UserCreate

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """
    Get current user information
    """
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update current user information
    """
    update_data = user_data.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return UserResponse.model_validate(current_user)


@router.get("", response_model=List[UserResponse])
@router.get("/", response_model=List[UserResponse], include_in_schema=False)
async def list_users(
    skip: int = 0,
    limit: int = 100,
    role: str = None,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    List users (Manager/Admin only)
    """
    query = db.query(User).filter(User.company_id == current_user.company_id)
    
    if role:
        query = query.filter(User.role == role)
    
    users = query.offset(skip).limit(limit).all()
    return [UserResponse.model_validate(user) for user in users]


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
@check_plan_limit("professionals")
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Create a new user (Manager/Admin only)
    """
    if user_data.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Não autorizado a criar usuário nesta empresa"
        )
    
    existing = db.query(User).filter(
        User.email == user_data.email
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado"
        )
    
    user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        phone=user_data.phone,
        role=user_data.role,
        company_id=user_data.company_id,
        is_active=True
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return UserResponse.model_validate(user)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Get user by ID (Manager/Admin only)
    """
    user = db.query(User).filter(
        User.id == user_id,
        User.company_id == current_user.company_id
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    return UserResponse.model_validate(user)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Update user (Manager/Admin only)
    """
    from app.models.company_user import CompanyUser
    from app.core.roles import CompanyRole
    
    user = db.query(User).filter(
        User.id == user_id,
        User.company_id == current_user.company_id
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    update_data = user_data.dict(exclude_unset=True)
    
    # Se estiver tentando atualizar role, usar CompanyUser ao invés de User
    if 'role' in update_data or 'company_role' in update_data:
        # Pegar a role (pode vir como 'role' ou 'company_role')
        new_role = update_data.pop('role', None) or update_data.pop('company_role', None)
        
        if new_role:
            # Verificar se é uma role válida
            try:
                if isinstance(new_role, str):
                    CompanyRole(new_role)  # Valida se é uma CompanyRole válida
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Role inválida: {new_role}. Use: COMPANY_OWNER, COMPANY_MANAGER, COMPANY_PROFESSIONAL, etc."
                )
            
            # Buscar ou criar CompanyUser
            company_user = db.query(CompanyUser).filter(
                CompanyUser.user_id == user_id,
                CompanyUser.company_id == current_user.company_id
            ).first()
            
            if company_user:
                # Atualizar role existente
                company_user.role = new_role
            else:
                # Criar novo CompanyUser com a role
                company_user = CompanyUser(
                    user_id=user_id,
                    company_id=current_user.company_id,
                    role=new_role,
                    is_active=True
                )
                db.add(company_user)
    
    # Atualizar campos restantes no User
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return UserResponse.model_validate(user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Delete user (Manager/Admin only)
    """
    user = db.query(User).filter(
        User.id == user_id,
        User.company_id == current_user.company_id
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Soft delete - just deactivate
    user.is_active = False
    db.commit()
    
    return None


@router.get("/professionals/available", response_model=List[UserResponse])
async def get_available_professionals(
    service_id: int = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get available professionals for a service
    """
    query = db.query(User).filter(
        User.company_id == current_user.company_id,
        User.role == UserRole.PROFESSIONAL,
        User.is_active == True
    )
    
    professionals = query.all()
    return [UserResponse.model_validate(prof) for prof in professionals]
