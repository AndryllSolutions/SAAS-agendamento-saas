"""
Advanced Rate Limiting by User and IP
"""
from fastapi import Request, HTTPException, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from typing import Optional
import logging

logger = logging.getLogger(__name__)


def get_user_identifier(request: Request) -> str:
    """
    Get user identifier for rate limiting
    Priority: user_id > API key > IP address
    
    Args:
        request: FastAPI request object
        
    Returns:
        Unique identifier string for rate limiting
    """
    # 1. Tentar obter user_id do token JWT
    user = getattr(request.state, "user", None)
    if user and hasattr(user, "id"):
        return f"user:{user.id}"
    
    # 2. Tentar obter API key dos headers
    api_key = request.headers.get("X-API-Key")
    if api_key:
        return f"apikey:{api_key}"
    
    # 3. Fallback para IP address
    return f"ip:{get_remote_address(request)}"


def get_user_or_ip(request: Request) -> str:
    """
    Wrapper para compatibilidade com SlowAPI
    """
    return get_user_identifier(request)


# Criar limiter com identificador por usuário
limiter = Limiter(
    key_func=get_user_or_ip,
    default_limits=["1000/hour", "100/minute"],
    storage_uri="memory://",  # Usar Redis em produção
    strategy="fixed-window",
)


# Rate limits específicos por tipo de endpoint

# Autenticação (mais restritivo)
AUTH_RATE_LIMIT = "5/minute"

# APIs públicas (sem autenticação)
PUBLIC_RATE_LIMIT = "20/minute"

# APIs autenticadas (por usuário)
USER_RATE_LIMIT = "100/minute"

# APIs administrativas
ADMIN_RATE_LIMIT = "200/minute"

# Upload de arquivos
UPLOAD_RATE_LIMIT = "10/hour"

# Exportação de relatórios
EXPORT_RATE_LIMIT = "20/hour"


async def check_rate_limit_exceeded(
    request: Request,
    max_requests: int,
    window_seconds: int = 60
) -> bool:
    """
    Check if rate limit is exceeded for current user/IP
    
    Args:
        request: FastAPI request
        max_requests: Maximum requests allowed
        window_seconds: Time window in seconds
        
    Returns:
        True if limit exceeded, False otherwise
    """
    try:
        identifier = get_user_identifier(request)
        
        # TODO: Implementar com Redis para produção
        # Por enquanto, retorna False (sem limite)
        
        return False
    except Exception as e:
        logger.error(f"Erro ao verificar rate limit: {e}")
        return False


def rate_limit_exceeded_handler(request: Request, exc: Exception):
    """
    Custom handler for rate limit exceeded errors
    """
    identifier = get_user_identifier(request)
    logger.warning(f"⚠️ Rate limit excedido para: {identifier}")
    
    raise HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail={
            "error": "rate_limit_exceeded",
            "message": "Muitas requisições. Por favor, aguarde alguns instantes e tente novamente.",
            "retry_after": 60  # segundos
        },
        headers={"Retry-After": "60"}
    )

