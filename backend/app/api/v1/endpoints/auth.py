"""
Authentication Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
import json

from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_active_user,
)
from app.core.roles import SaaSRole, CompanyRole
from app.core.rbac import Scope
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.company import Company
from app.models.company_subscription import CompanySubscription
from app.models.company_user import CompanyUser
from app.schemas.user import UserCreate, UserResponse, UserLogin, Token, PasswordChange, RefreshTokenRequest

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)

@router.options("/login")
async def login_options(request: Request):
    """
    Handle OPTIONS preflight requests for login endpoint.
    Required for CORS with credentials.
    """
    from fastapi.responses import JSONResponse
    
    origin = request.headers.get("origin")
    
    # Get allowed origins from settings
    cors_origins = settings.get_cors_origins()
    
    # Check if origin is allowed
    allowed_origin = None
    if origin:
        # Check exact match first
        if origin in cors_origins:
            allowed_origin = origin
        # Check if CORS_ALLOW_ALL is enabled
        elif settings.CORS_ALLOW_ALL:
            allowed_origin = origin
    
    # Create response
    response = JSONResponse(content={})
    
    # Set CORS headers
    if allowed_origin:
        response.headers["Access-Control-Allow-Origin"] = allowed_origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    elif origin and "*" not in cors_origins:
        # If origin is not allowed and we're not using wildcard, reject
        response.headers["Access-Control-Allow-Origin"] = "null"
    else:
        # Fallback: allow the origin (for development)
        response.headers["Access-Control-Allow-Origin"] = origin or "*"
        if origin:
            response.headers["Access-Control-Allow-Credentials"] = "true"
    
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
    response.headers["Access-Control-Allow-Headers"] = (
        "Content-Type, Authorization, X-Requested-With, "
        "X-CSRFToken, Accept, "
        "Accept-Language, Content-Language, Origin, "
        "Access-Control-Request-Method, Access-Control-Request-Headers"
    )
    response.headers["Access-Control-Max-Age"] = "3600"
    response.headers["Access-Control-Expose-Headers"] = "Authorization, Content-Type"
    
    if settings.DEBUG:
        print(f"🔓 OPTIONS /login - Origin: {origin}, Allowed: {allowed_origin is not None}")
    
    return response

@router.options("/login/json")
async def login_json_options(request: Request):
    """Handle OPTIONS preflight for /login/json endpoint"""
    return await login_options(request)

@router.options("/login-json")
async def login_json_alt_options(request: Request):
    """Handle OPTIONS preflight for /login-json endpoint"""
    return await login_options(request)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: dict, response: Response, db: Session = Depends(get_db)):
    """
    Registro completo de SaaS multi-tenant.

    Espera um JSON com:
    {
      "name": "",
      "email": "",
      "phone": "",
      "password": "",
      "company_name": "",
      "business_type": "",
      "timezone": "America/Sao_Paulo",
      "currency": "BRL",
      "team_size": "",
      "slug": "",
      "plan_type": "FREE" | "TRIAL",
      "trial_end_date": "",
      "referral_code": "",
      "coupon_code": ""
    }
    """
    required_fields = ["name", "email", "password", "company_name", "business_type", "team_size", "slug", "plan_type"]
    missing = [field for field in required_fields if not payload.get(field)]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Campos obrigatórios ausentes: {', '.join(missing)}"
        )

    existing_user = db.query(User).filter(User.email == payload["email"]).first()
    existing_company = db.query(Company).filter(Company.slug == payload["slug"]).first()

    if existing_user or existing_company:
        if (
            existing_user
            and existing_company
            and existing_user.company_id
            and existing_user.company_id == existing_company.id
        ):
            response.status_code = status.HTTP_200_OK
            return UserResponse.model_validate(existing_user)

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já cadastrado"
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slug da empresa já está em uso"
        )

    from datetime import datetime, timedelta as td

    try:
        # 1) Criar empresa (tenant)
        company = Company(
            name=payload["company_name"],
            slug=payload["slug"],
            email=payload["email"],
            phone=payload.get("phone"),
            timezone=payload.get("timezone") or "America/Sao_Paulo",
            currency=payload.get("currency") or "BRL",
            business_type=payload.get("business_type"),
            team_size=payload.get("team_size"),
            subscription_plan="BASIC" if payload.get("plan_type") == "FREE" else "PRO",
        )
        db.add(company)
        db.flush()  # garante company.id

        # 2) Criar subscription/controlador de trial
        plan_type = payload.get("plan_type", "FREE")
        # trial_end_date: se veio no payload, usa; senão calcula NOW + 14 dias para TRIAL
        trial_end = None
        if plan_type.upper() == "TRIAL":
            trial_end = datetime.utcnow() + td(days=14)
            # também refletir na empresa para compatibilidade
            company.subscription_expires_at = trial_end

        subscription = CompanySubscription(
            company_id=company.id,
            plan_type=plan_type.upper(),
            trial_end_date=trial_end,
            coupon_code=payload.get("coupon_code"),
            referral_code=payload.get("referral_code"),
        )
        db.add(subscription)

        # 3) Criar usuário OWNER vinculado ao tenant
        user = User(
            email=payload["email"],
            password_hash=get_password_hash(payload["password"]),
            full_name=payload["name"],
            phone=payload.get("phone"),
            role=UserRole.OWNER,
            company_id=company.id,
        )
        db.add(user)
        db.flush()

        # 4) Registrar vínculo em company_users
        company_user_link = CompanyUser(
            company_id=company.id,
            user_id=user.id,
            role=CompanyRole.COMPANY_OWNER,
            is_active="active",
            invited_at=datetime.utcnow(),
            joined_at=datetime.utcnow(),
        )
        db.add(company_user_link)
        
        # Commit de toda a transação
        db.commit()
        db.refresh(user)
        return UserResponse.model_validate(user)
    except HTTPException:
        # Re-raise HTTP exceptions sem fazer rollback (já foram tratadas)
        db.rollback()
        raise
    except Exception as e:
        # Rollback em caso de erro
        db.rollback()
        import traceback
        error_details = traceback.format_exc()
        print(f"❌ Erro no registro: {error_details}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar conta: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login with email and password (OAuth2 form format)
    """
    return await _perform_login(form_data.username, form_data.password, db)


@router.post("/login-json", response_model=Token)
async def login_json(
    login_data: dict,  # {"email": "...", "password": "..."}
    db: Session = Depends(get_db)
):
    """
    Login with email and password (JSON format for frontend)
    """
    email = login_data.get("email")
    password = login_data.get("password")
    
    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )
    
    return await _perform_login(email, password, db)


@router.post("/login/json", response_model=Token)
async def login_json(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Login with email and password (JSON format - for mobile apps)
    
    Request body (aceita ambos):
    {
        "email": "usuario@exemplo.com",
        "password": "senha123"
    }
    
    Ou:
    {
        "username": "usuario@exemplo.com",  # Alternativa a email
        "password": "senha123"
    }
    """
    try:
        body = await request.json()
        
        # Aceita tanto 'email' quanto 'username' para compatibilidade
        email = body.get("email") or body.get("username")
        password = body.get("password")
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Campo 'email' ou 'username' é obrigatório. Envie JSON: {'email': '...', 'password': '...'}"
            )
        
        if not password:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Campo 'password' é obrigatório. Envie JSON: {'email': '...', 'password': '...'}"
            )
        
        return await _perform_login(email, password, db)
        
    except HTTPException:
        raise
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Formato inválido. Envie JSON com Content-Type: application/json. Exemplo: {'email': 'usuario@exemplo.com', 'password': 'senha123'}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Erro ao processar requisição: {str(e)}. Verifique se está enviando JSON válido."
        )


async def _perform_login(email: str, password: str, db: Session):
    """
    Internal function to perform login logic
    """
    try:
        # Find user
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"❌ Login failed: User not found - {email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciais inválidas",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        print(f"🔍 User found: {email}, checking password...")
        
        if not verify_password(password, user.password_hash):
            print(f"❌ Login failed: Invalid password for {email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciais inválidas",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        print(f"✅ Password verified for {email}")

        # MIGRAÇÃO AUTOMÁTICA: Se o usuário usou hash bcrypt, migrar para argon2
        if user.password_hash.startswith("$2b$"):  # Identifica hash bcrypt
            try:
                # Gerar novo hash argon2 com a senha verificada
                new_hash = get_password_hash(password)
                user.password_hash = new_hash
                db.commit()  # Salvar no banco
                print(f"✅ Hash migrado para argon2: {user.email}")
            except Exception as e:
                print(f"⚠️ Erro na migração de hash: {e}")
                # Não falhar o login se a migração der erro
                pass
        
        if not user.is_active:
            print(f"❌ Login failed: User inactive - {email}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuário inativo"
            )
        
        print(f"✅ User active: {email}")
        
        # Determine scope and roles from user
        saas_role = None
        company_role = None
        company_id = None
        scope = Scope.COMPANY
        
        # Check if user has SaaS role
        if user.saas_role:
            saas_role = user.saas_role
            # SaaS admins can login with SaaS scope (no company_id required)
            # But they can also login with company scope if they have a company_id
            if user.company_id:
                # User has both SaaS role and company - default to company scope
                scope = Scope.COMPANY
                company_id = user.company_id
            else:
                # Pure SaaS admin - use SaaS scope
                scope = Scope.SAAS
        
        # Get company role from CompanyUser if available
        if user.company_id:
            company_id = user.company_id
            try:
                company_user = db.query(CompanyUser).filter(
                    CompanyUser.user_id == user.id,
                    CompanyUser.company_id == user.company_id
                ).first()
                if company_user:
                    # Get role from CompanyUser (now uses CompanyRole enum)
                    # Handle both enum and string values (for compatibility)
                    role_value = company_user.role
                    
                    # If it's already a CompanyRole enum, get its value
                    if isinstance(role_value, CompanyRole):
                        company_role = role_value.value
                    # If it's a string, try to convert it
                    elif isinstance(role_value, str):
                        # Try direct conversion first
                        try:
                            company_role = CompanyRole(role_value).value
                        except (ValueError, AttributeError):
                            # Map legacy role strings to CompanyRole
                            role_mapping = {
                                "OWNER": CompanyRole.COMPANY_OWNER.value,
                                "MANAGER": CompanyRole.COMPANY_MANAGER.value,
                                "PROFESSIONAL": CompanyRole.COMPANY_PROFESSIONAL.value,
                                "RECEPTIONIST": CompanyRole.COMPANY_RECEPTIONIST.value,
                                "FINANCE": CompanyRole.COMPANY_FINANCE.value,
                                "CLIENT": CompanyRole.COMPANY_CLIENT.value,
                                "READ_ONLY": CompanyRole.COMPANY_READ_ONLY.value,
                                "OPERATOR": CompanyRole.COMPANY_OPERATOR.value,
                                # Handle enum values that might be stored as strings
                                "COMPANY_OWNER": CompanyRole.COMPANY_OWNER.value,
                                "COMPANY_MANAGER": CompanyRole.COMPANY_MANAGER.value,
                                "COMPANY_PROFESSIONAL": CompanyRole.COMPANY_PROFESSIONAL.value,
                                "COMPANY_RECEPTIONIST": CompanyRole.COMPANY_RECEPTIONIST.value,
                                "COMPANY_FINANCE": CompanyRole.COMPANY_FINANCE.value,
                                "COMPANY_CLIENT": CompanyRole.COMPANY_CLIENT.value,
                                "COMPANY_READ_ONLY": CompanyRole.COMPANY_READ_ONLY.value,
                                "COMPANY_OPERATOR": CompanyRole.COMPANY_OPERATOR.value,
                            }
                            company_role = role_mapping.get(role_value.upper(), CompanyRole.COMPANY_CLIENT.value)
                    else:
                        # Fallback to default
                        company_role = CompanyRole.COMPANY_CLIENT.value
                else:
                    # Fallback: map User.role to CompanyRole
                    role_mapping = {
                        UserRole.OWNER: CompanyRole.COMPANY_OWNER.value,
                        UserRole.MANAGER: CompanyRole.COMPANY_MANAGER.value,
                        UserRole.PROFESSIONAL: CompanyRole.COMPANY_PROFESSIONAL.value,
                        UserRole.RECEPTIONIST: CompanyRole.COMPANY_RECEPTIONIST.value,
                        UserRole.FINANCE: CompanyRole.COMPANY_FINANCE.value,
                        UserRole.CLIENT: CompanyRole.COMPANY_CLIENT.value,
                        UserRole.READ_ONLY: CompanyRole.COMPANY_READ_ONLY.value,
                    }
                    company_role = role_mapping.get(user.role, CompanyRole.COMPANY_CLIENT.value)
            except Exception as e:
                print(f"⚠️ Erro ao buscar company_user: {e}")
                company_role = CompanyRole.COMPANY_CLIENT.value
        
        print(f"✅ Roles: saas_role={saas_role}, company_role={company_role}, scope={scope.value}")
        
        # Create tokens with RBAC context
        try:
            access_token = create_access_token(
                data={"sub": str(user.id)},
                saas_role=saas_role,
                company_role=company_role,
                company_id=company_id,
                scope=scope.value
            )
            refresh_token = create_refresh_token(data={"sub": str(user.id)})
            print(f"✅ Tokens created successfully")
        except Exception as e:
            print(f"❌ Erro ao criar tokens: {e}")
            import traceback
            traceback.print_exc()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao criar tokens: {str(e)}"
            )
        
        # Return tokens and user data
        try:
            user_response = UserResponse.model_validate(user).model_copy(update={"company_role": company_role})
            print(f"✅ UserResponse created successfully")
        except Exception as e:
            print(f"❌ Erro ao criar UserResponse: {e}")
            import traceback
            traceback.print_exc()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao processar dados do usuário: {str(e)}"
            )
        
        print(f"✅ Login successful for {email}")
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user_response
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erro inesperado no login: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno no login: {str(e)}"
        )

@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token (form format - OAuth2)
    Supports both form data and JSON for compatibility
    """
    from fastapi import Form
    
    refresh_token = None
    
    # Try to get from form data first (OAuth2 standard)
    try:
        form_data = await request.form()
        refresh_token = form_data.get("refresh_token")
    except:
        pass
    
    # If not in form, try JSON body
    if not refresh_token:
        try:
            body = await request.json()
            refresh_token = body.get("refresh_token") or body.get("refreshToken")
        except:
            pass
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="refresh_token é obrigatório"
        )
    
    return await _perform_refresh(refresh_token, db)


@router.post("/refresh/json", response_model=Token)
async def refresh_token_json(
    token_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token (JSON format - for mobile apps)
    """
    refresh_token = token_data.refresh_token or token_data.refreshToken
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="refresh_token é obrigatório"
        )
    
    return await _perform_refresh(refresh_token, db)


async def _perform_refresh(refresh_token: str, db: Session):
    """
    Internal function to perform token refresh
    """
    try:
        payload = decode_token(refresh_token)
        
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário não encontrado ou inativo"
            )
        
        # Extract context from old token if available
        old_payload = decode_token(refresh_token)
        saas_role = old_payload.get("saas_role")
        company_role = old_payload.get("company_role")
        company_id = old_payload.get("company_id")
        scope = old_payload.get("scope", "company")
        
        # Create new tokens with same context
        new_access_token = create_access_token(
            data={"sub": str(user.id)},
            saas_role=saas_role,
            company_role=company_role,
            company_id=company_id,
            scope=scope
        )
        new_refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }
    
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )

@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Change user password
    """
    # Verify old password
    if not verify_password(password_data.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha atual incorreta"
        )
    
    # Update password
    current_user.password_hash = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Senha alterada com sucesso"}