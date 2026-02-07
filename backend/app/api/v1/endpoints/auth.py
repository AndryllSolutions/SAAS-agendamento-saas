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
from app.schemas.user import UserCreate, UserResponse, UserLogin, Token, PasswordChange, RefreshTokenRequest, PasswordReset, PasswordResetConfirm
import secrets
import time

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
    Com proteção contra brute force: lockout após 5 tentativas falhas.
    """
    from app.services.token_blacklist import (
        is_account_locked, record_failed_login, lock_account, clear_failed_logins
    )
    
    # Verificar se a conta está bloqueada
    if await is_account_locked(email):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Conta temporariamente bloqueada por excesso de tentativas. Tente novamente em 15 minutos.",
        )
    
    # Find user
    user = db.query(User).filter(User.email == email).first()
    
    if not user or not verify_password(password, user.password_hash):
        # Registrar tentativa falha
        attempts = await record_failed_login(email)
        
        # Bloquear após 5 tentativas
        if attempts >= 5:
            await lock_account(email, duration=900)  # 15 minutos
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Conta bloqueada por 15 minutos após 5 tentativas falhas.",
            )
        
        remaining = 5 - attempts
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Login bem-sucedido: limpar tentativas
    await clear_failed_logins(email)

    # MIGRAÇÃO AUTOMÁTICA: Se o usuário usou hash bcrypt, migrar para argon2
    if user and user.password_hash.startswith("$2b$"):  # Identifica hash bcrypt
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
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo"
        )
    
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
    
    # Create tokens with RBAC context (inclui iat para revogação)
    access_token = create_access_token(
        data={"sub": str(user.id), "iat": int(time.time())},
        saas_role=saas_role,
        company_role=company_role,
        company_id=company_id,
        scope=scope.value
    )
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    # Return tokens and user data
    user_response = UserResponse.model_validate(user).model_copy(update={"company_role": company_role})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_response
    }

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
    
    # Revogar TODAS as sessões anteriores (força re-login)
    from app.services.token_blacklist import blacklist_all_user_tokens
    await blacklist_all_user_tokens(current_user.id)
    
    return {"message": "Senha alterada com sucesso. Todas as sessões anteriores foram encerradas."}

# ============================================================
# FORGOT PASSWORD / RESET PASSWORD
# ============================================================

@router.post("/forgot-password")
async def forgot_password(
    payload: PasswordReset,
    db: Session = Depends(get_db)
):
    """
    Solicitar reset de senha.
    Envia email com link/token para redefinir a senha.
    
    ANTI-ENUMERAÇÃO: Sempre retorna a mesma mensagem,
    independente de o email existir ou não.
    """
    from app.services.token_blacklist import store_reset_token
    from app.services.notification_service import NotificationService
    
    # Sempre retorna sucesso (anti-enumeração)
    success_message = "Se o email estiver cadastrado, você receberá instruções para redefinir sua senha."
    
    user = db.query(User).filter(User.email == payload.email).first()
    
    if not user:
        # Retorna a mesma mensagem para não revelar se o email existe
        return {"message": success_message}
    
    # Gerar token seguro
    reset_token = secrets.token_urlsafe(48)
    
    # Armazenar no Redis (válido por 1 hora)
    await store_reset_token(payload.email, reset_token, ttl=3600)
    
    # Montar link de reset
    frontend_url = settings.FRONTEND_URL or "https://atendo.website"
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"
    
    # Enviar email
    subject = "Redefinição de Senha - Atendo"
    body = f"""Olá {user.full_name},

Recebemos uma solicitação para redefinir sua senha.

Clique no link abaixo para criar uma nova senha:
{reset_link}

Este link é válido por 1 hora.

Se você não solicitou esta alteração, ignore este email.

Atenciosamente,
Equipe Atendo"""

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7C3AED;">aTendo</h1>
        </div>
        <h2 style="color: #333;">Redefinição de Senha</h2>
        <p>Olá <strong>{user.full_name}</strong>,</p>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_link}" 
               style="background-color: #7C3AED; color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold;
                      display: inline-block;">
                Redefinir Senha
            </a>
        </div>
        <p style="color: #666; font-size: 14px;">Este link é válido por <strong>1 hora</strong>.</p>
        <p style="color: #666; font-size: 14px;">Se você não solicitou esta alteração, ignore este email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
            Equipe Atendo - Sistema de Agendamento Online
        </p>
    </div>
    """
    
    NotificationService.send_email(
        to_email=payload.email,
        subject=subject,
        body=body,
        html_body=html_body
    )
    
    return {"message": success_message}


@router.post("/reset-password")
async def reset_password(
    payload: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """
    Redefinir senha usando token recebido por email.
    """
    from app.services.token_blacklist import verify_reset_token, invalidate_reset_token, blacklist_all_user_tokens
    
    # Verificar token
    email = await verify_reset_token(payload.token)
    
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido ou expirado. Solicite um novo link de redefinição."
        )
    
    # Buscar usuário
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Atualizar senha
    user.password_hash = get_password_hash(payload.new_password)
    db.commit()
    
    # Invalidar o token de reset (uso único)
    await invalidate_reset_token(payload.token)
    
    # Revogar todas as sessões anteriores
    await blacklist_all_user_tokens(user.id)
    
    return {"message": "Senha redefinida com sucesso. Faça login com sua nova senha."}


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_active_user),
):
    """
    Logout - revoga o token atual do usuário.
    """
    from app.services.token_blacklist import blacklist_all_user_tokens
    
    await blacklist_all_user_tokens(current_user.id)
    
    return {"message": "Logout realizado com sucesso"}
