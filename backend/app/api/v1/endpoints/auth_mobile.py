"""
Mobile-Optimized Authentication Endpoints
Endpoints específicos para dispositivos móveis com melhor suporte
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import timedelta
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
from app.core.config import settings
from app.models.user import User
from app.schemas.user import Token

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)

@router.options("/mobile/login")
async def mobile_login_options(request: Request):
    """Handle OPTIONS preflight requests for mobile login - PERMISSIVO"""
    origin = request.headers.get("origin")
    response = JSONResponse({})
    
    # SEMPRE aceitar qualquer origin
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
    else:
        response.headers["Access-Control-Allow-Origin"] = "*"
    
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD"
    # Não pode usar "*" com credentials, então lista explícita de headers comuns
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept, Origin, X-Requested-With, X-Requested-By, Cache-Control, Pragma, Access-Control-Request-Method, Access-Control-Request-Headers"
    response.headers["Access-Control-Max-Age"] = "86400"
    
    print(f"🔓 OPTIONS preflight - Origin: {origin}")
    
    return response

@router.post("/mobile/login", response_model=Token)
async def mobile_login(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Login otimizado para dispositivos móveis
    
    Aceita JSON:
    {
        "email": "usuario@exemplo.com",
        "password": "senha123"
    }
    
    Retorna tokens e configura headers para mobile
    """
    try:
        body = await request.json()
        email = body.get("email") or body.get("username")
        password = body.get("password")
        
        if not email or not password:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Email e senha são obrigatórios"
            )
        
        # Find user
        user = db.query(User).filter(User.email == email).first()
        
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciais inválidas",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuário inativo"
            )
        
        # Create tokens
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        # Criar resposta com headers otimizados para mobile
        response = JSONResponse({
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user_id": str(user.id),
            "email": user.email,
            "role": user.role.value if hasattr(user.role, 'value') else str(user.role)
        })
        
        # Headers específicos para mobile - PERMISSIVO
        origin = request.headers.get("origin")
        # SEMPRE aceitar qualquer origin em desenvolvimento
        if origin:
            response.headers["Access-Control-Allow-Origin"] = origin
        else:
            response.headers["Access-Control-Allow-Origin"] = "*"
        
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD"
        # Não pode usar "*" com credentials, então lista explícita de headers comuns
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept, Origin, X-Requested-With, X-Requested-By, Cache-Control, Pragma, Access-Control-Request-Method, Access-Control-Request-Headers"
        response.headers["Access-Control-Expose-Headers"] = "Authorization, Content-Type, X-Request-Id, Content-Length, Access-Control-Allow-Origin"
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        
        # Log para debug
        print(f"🔓 Mobile login - Origin: {origin}, User: {email}")
        
        # Opcional: Set cookies também (para compatibilidade)
        if settings.COOKIE_DOMAIN:
            response.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=settings.COOKIE_SECURE,
                samesite=settings.COOKIE_SAME_SITE,
                domain=settings.COOKIE_DOMAIN,
                max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
            )
        
        return response
        
    except HTTPException:
        raise
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Formato inválido. Envie JSON: {'email': '...', 'password': '...'}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar login: {str(e)}"
        )
