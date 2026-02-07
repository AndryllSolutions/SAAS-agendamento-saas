"""
Token Blacklist Service - Gerencia revogação de tokens via Redis
"""
import logging
from typing import Optional
from app.core.cache import get_redis
import redis.asyncio as aioredis
from app.core.config import settings

_local_redis: aioredis.Redis = None

async def _get_redis_safe() -> aioredis.Redis:
    """Get Redis com retry e reconexão automática."""
    global _local_redis
    try:
        # Tentar usar o get_redis global primeiro
        r = await get_redis()
        if r is not None:
            await r.ping()
            return r
    except Exception:
        pass
    
    # Fallback: criar conexão própria
    try:
        if _local_redis is not None:
            try:
                await _local_redis.ping()
                return _local_redis
            except Exception:
                _local_redis = None
        
        _local_redis = await aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
        )
        await _local_redis.ping()
        return _local_redis
    except Exception as e:
        logger.error(f"Redis indisponível: {e}")
        return None

logger = logging.getLogger(__name__)

# Prefixos Redis
BLACKLIST_PREFIX = "token:blacklist:"
LOGIN_ATTEMPTS_PREFIX = "login:attempts:"
LOGIN_LOCKOUT_PREFIX = "login:lockout:"
RESET_TOKEN_PREFIX = "password:reset:"


async def blacklist_token(token_jti: str, ttl: int = 3600) -> bool:
    """
    Adiciona um token à blacklist.
    
    Args:
        token_jti: Identificador único do token (sub + iat)
        ttl: Tempo de vida em segundos (deve ser >= tempo restante do token)
    """
    try:
        redis = await _get_redis_safe()
        if redis is None:
            logger.warning("Redis indisponível - token não foi blacklisted")
            return False
        
        key = f"{BLACKLIST_PREFIX}{token_jti}"
        await redis.setex(key, ttl, "revoked")
        logger.info(f"🔒 Token blacklisted: {token_jti[:20]}...")
        return True
    except Exception as e:
        logger.error(f"❌ Erro ao blacklistar token: {e}")
        return False


async def is_token_blacklisted(token_jti: str) -> bool:
    """Verifica se um token está na blacklist."""
    try:
        redis = await _get_redis_safe()
        if redis is None:
            return False
        
        key = f"{BLACKLIST_PREFIX}{token_jti}"
        result = await redis.get(key)
        return result is not None
    except Exception as e:
        logger.error(f"❌ Erro ao verificar blacklist: {e}")
        return False


async def blacklist_all_user_tokens(user_id: int) -> bool:
    """
    Revoga TODOS os tokens de um usuário.
    Usa um marcador de 'revogação global' com timestamp.
    """
    try:
        redis = await _get_redis_safe()
        if redis is None:
            return False
        
        import time
        key = f"user:revoked_at:{user_id}"
        # Marca o timestamp atual - qualquer token emitido ANTES disso é inválido
        await redis.setex(key, 86400 * 30, str(int(time.time())))
        logger.info(f"🔒 Todos os tokens do usuário {user_id} foram revogados")
        return True
    except Exception as e:
        logger.error(f"❌ Erro ao revogar tokens do usuário {user_id}: {e}")
        return False


async def is_user_token_revoked(user_id: int, token_iat: int) -> bool:
    """
    Verifica se o token do usuário foi revogado (emitido antes da revogação global).
    """
    try:
        redis = await _get_redis_safe()
        if redis is None:
            return False
        
        key = f"user:revoked_at:{user_id}"
        revoked_at = await redis.get(key)
        
        if revoked_at is None:
            return False
        
        # Token emitido antes da revogação é inválido
        return token_iat < int(revoked_at)
    except Exception as e:
        logger.error(f"❌ Erro ao verificar revogação: {e}")
        return False


# ============================================================
# LOGIN ATTEMPTS / LOCKOUT
# ============================================================

async def record_failed_login(email: str) -> int:
    """
    Registra uma tentativa de login falha.
    Retorna o número total de tentativas.
    """
    try:
        redis = await _get_redis_safe()
        if redis is None:
            return 0
        
        key = f"{LOGIN_ATTEMPTS_PREFIX}{email.lower()}"
        attempts = await redis.incr(key)
        
        # Expira em 15 minutos
        if attempts == 1:
            await redis.expire(key, 900)
        
        return attempts
    except Exception as e:
        logger.error(f"❌ Erro ao registrar tentativa falha: {e}")
        return 0


async def clear_failed_logins(email: str) -> None:
    """Limpa tentativas de login falhas após login bem-sucedido."""
    try:
        redis = await _get_redis_safe()
        if redis is None:
            return
        
        key = f"{LOGIN_ATTEMPTS_PREFIX}{email.lower()}"
        await redis.delete(key)
    except Exception as e:
        logger.error(f"❌ Erro ao limpar tentativas: {e}")


async def is_account_locked(email: str) -> bool:
    """Verifica se a conta está bloqueada por excesso de tentativas."""
    try:
        redis = await _get_redis_safe()
        if redis is None:
            return False
        
        lockout_key = f"{LOGIN_LOCKOUT_PREFIX}{email.lower()}"
        locked = await redis.get(lockout_key)
        return locked is not None
    except Exception as e:
        logger.error(f"❌ Erro ao verificar lockout: {e}")
        return False


async def lock_account(email: str, duration: int = 900) -> None:
    """
    Bloqueia a conta por X segundos (padrão: 15 minutos).
    """
    try:
        redis = await _get_redis_safe()
        if redis is None:
            return
        
        lockout_key = f"{LOGIN_LOCKOUT_PREFIX}{email.lower()}"
        await redis.setex(lockout_key, duration, "locked")
        logger.warning(f"🔒 Conta bloqueada: {email} por {duration}s")
    except Exception as e:
        logger.error(f"❌ Erro ao bloquear conta: {e}")


# ============================================================
# PASSWORD RESET TOKENS
# ============================================================

async def store_reset_token(email: str, token: str, ttl: int = 3600) -> bool:
    """Armazena token de reset de senha (válido por 1 hora)."""
    try:
        redis = await _get_redis_safe()
        if redis is None:
            return False
        
        key = f"{RESET_TOKEN_PREFIX}{token}"
        await redis.setex(key, ttl, email.lower())
        return True
    except Exception as e:
        logger.error(f"❌ Erro ao armazenar reset token: {e}")
        return False


async def verify_reset_token(token: str) -> Optional[str]:
    """
    Verifica e retorna o email associado ao token de reset.
    Retorna None se inválido/expirado.
    """
    try:
        redis = await _get_redis_safe()
        if redis is None:
            return None
        
        key = f"{RESET_TOKEN_PREFIX}{token}"
        email = await redis.get(key)
        
        if email is None:
            return None
        
        return email.decode() if isinstance(email, bytes) else email
    except Exception as e:
        logger.error(f"❌ Erro ao verificar reset token: {e}")
        return None


async def invalidate_reset_token(token: str) -> None:
    """Invalida um token de reset após uso."""
    try:
        redis = await _get_redis_safe()
        if redis is None:
            return
        
        key = f"{RESET_TOKEN_PREFIX}{token}"
        await redis.delete(key)
    except Exception as e:
        logger.error(f"❌ Erro ao invalidar reset token: {e}")
