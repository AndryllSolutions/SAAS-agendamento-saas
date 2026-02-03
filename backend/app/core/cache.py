"""
Redis caching utilities for FastAPI
"""
import json
import hashlib
import asyncio
from typing import Any, Optional, Callable
from functools import wraps
import redis.asyncio as aioredis
from fastapi import Request
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# Redis client (singleton)
_redis_client: Optional[aioredis.Redis] = None


async def get_redis() -> aioredis.Redis:
    """Get Redis client instance with optimized connection pool"""
    global _redis_client
    
    if _redis_client is None:
        try:
            # Parse Redis URL to extract password if present
            redis_url = settings.REDIS_URL
            
            # Create connection pool with optimized settings
            _redis_client = await aioredis.from_url(
                redis_url,
                encoding="utf-8",
                decode_responses=True,
                # Connection pool optimization
                max_connections=200,  # Increased from 50 for better concurrency
                socket_connect_timeout=10,  # Increased from 5s
                socket_timeout=30,  # Increased from 5s for long operations
                socket_keepalive=True,  # Keep connections alive
                socket_keepalive_options={
                    1: 1,  # TCP_KEEPIDLE: start keepalive after 1 second of idle
                    2: 1,  # TCP_KEEPINTVL: send keepalive every 1 second
                    3: 3,  # TCP_KEEPCNT: send 3 keepalive probes before considering dead
                },
                # Retry configuration
                retry_on_timeout=True,
                retry_on_error=[ConnectionError, TimeoutError],
                # Health check
                health_check_interval=30,  # Check connection health every 30s
            )
            logger.info("✅ Redis conectado com sucesso (pool otimizado)")
        except Exception as e:
            logger.error(f"❌ Erro ao conectar ao Redis: {e}")
            _redis_client = None
    
    return _redis_client


async def close_redis():
    """Close Redis connection"""
    global _redis_client
    
    if _redis_client:
        await _redis_client.close()
        _redis_client = None
        logger.info("Redis connection closed")


def cache_key_builder(
    func_name: str,
    args: tuple = (),
    kwargs: dict = {},
    prefix: str = "cache"
) -> str:
    """
    Build cache key from function name and arguments
    
    Args:
        func_name: Function name
        args: Positional arguments
        kwargs: Keyword arguments
        prefix: Cache key prefix
        
    Returns:
        Cache key string
    """
    # Serializar argumentos
    key_parts = [prefix, func_name]
    
    if args:
        key_parts.append(str(args))
    
    if kwargs:
        # Ordenar kwargs para consistência
        sorted_kwargs = sorted(kwargs.items())
        key_parts.append(str(sorted_kwargs))
    
    # Gerar hash para keys muito longas
    key_str = ":".join(key_parts)
    if len(key_str) > 200:
        key_hash = hashlib.md5(key_str.encode()).hexdigest()
        return f"{prefix}:{func_name}:{key_hash}"
    
    return key_str


async def get_cache(key: str) -> Optional[Any]:
    """
    Get value from cache with retry logic
    
    Args:
        key: Cache key
        
    Returns:
        Cached value or None if not found
    """
    max_retries = 3
    for attempt in range(max_retries):
        try:
            redis = await get_redis()
            if redis is None:
                return None
            
            value = await redis.get(key)
            if value:
                return json.loads(value)
            return None
        except (ConnectionError, TimeoutError) as e:
            if attempt < max_retries - 1:
                logger.warning(f"⚠️ Tentativa {attempt + 1}/{max_retries} ao buscar cache {key}: {e}")
                await asyncio.sleep(0.1 * (attempt + 1))  # Exponential backoff
                continue
            logger.error(f"❌ Erro ao buscar cache {key} após {max_retries} tentativas: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ Erro ao buscar cache {key}: {e}")
            return None
    return None


async def set_cache(key: str, value: Any, ttl: int = 300) -> bool:
    """
    Set value in cache with retry logic
    
    Args:
        key: Cache key
        value: Value to cache
        ttl: Time to live in seconds (default 5 minutes)
        
    Returns:
        True if successful, False otherwise
    """
    max_retries = 3
    for attempt in range(max_retries):
        try:
            redis = await get_redis()
            if redis is None:
                return False
            
            serialized = json.dumps(value, default=str)
            await redis.setex(key, ttl, serialized)
            return True
        except (ConnectionError, TimeoutError) as e:
            if attempt < max_retries - 1:
                logger.warning(f"⚠️ Tentativa {attempt + 1}/{max_retries} ao salvar cache {key}: {e}")
                await asyncio.sleep(0.1 * (attempt + 1))  # Exponential backoff
                continue
            logger.error(f"❌ Erro ao salvar cache {key} após {max_retries} tentativas: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ Erro ao salvar cache {key}: {e}")
            return False
    return False


async def delete_cache(key: str) -> bool:
    """
    Delete value from cache
    
    Args:
        key: Cache key
        
    Returns:
        True if successful, False otherwise
    """
    try:
        redis = await get_redis()
        if redis is None:
            return False
        
        await redis.delete(key)
        return True
    except Exception as e:
        logger.error(f"❌ Erro ao deletar cache {key}: {e}")
        return False


async def delete_pattern(pattern: str) -> int:
    """
    Delete all keys matching pattern
    
    Args:
        pattern: Pattern to match (e.g., "cache:users:*")
        
    Returns:
        Number of keys deleted
    """
    try:
        redis = await get_redis()
        if redis is None:
            return 0
        
        keys = []
        async for key in redis.scan_iter(match=pattern):
            keys.append(key)
        
        if keys:
            return await redis.delete(*keys)
        return 0
    except Exception as e:
        logger.error(f"❌ Erro ao deletar pattern {pattern}: {e}")
        return 0


def cached(ttl: int = 300, prefix: str = "cache"):
    """
    Decorator to cache function results
    
    Args:
        ttl: Time to live in seconds (default 5 minutes)
        prefix: Cache key prefix
        
    Example:
        @cached(ttl=600, prefix="users")
        async def get_user(user_id: int):
            return await db.query(User).filter(User.id == user_id).first()
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Construir cache key
            cache_key = cache_key_builder(
                func.__name__,
                args=args,
                kwargs=kwargs,
                prefix=prefix
            )
            
            # Tentar buscar do cache
            cached_value = await get_cache(cache_key)
            if cached_value is not None:
                logger.debug(f"✅ Cache HIT: {cache_key}")
                return cached_value
            
            # Executar função
            logger.debug(f"❌ Cache MISS: {cache_key}")
            result = await func(*args, **kwargs)
            
            # Salvar no cache
            await set_cache(cache_key, result, ttl=ttl)
            
            return result
        
        return wrapper
    return decorator


def cache_by_user(ttl: int = 300, prefix: str = "user_cache"):
    """
    Decorator to cache results per user
    
    Args:
        ttl: Time to live in seconds (default 5 minutes)
        prefix: Cache key prefix
        
    Example:
        @cache_by_user(ttl=600, prefix="appointments")
        async def get_user_appointments(user_id: int, db: Session):
            return await db.query(Appointment).filter(
                Appointment.user_id == user_id
            ).all()
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extrair user_id do primeiro argumento ou kwargs
            user_id = args[0] if args else kwargs.get('user_id')
            
            if user_id is None:
                # Se não houver user_id, executar sem cache
                return await func(*args, **kwargs)
            
            # Construir cache key com user_id
            cache_key = f"{prefix}:user:{user_id}:{func.__name__}"
            
            # Adicionar outros argumentos ao key
            if len(args) > 1 or kwargs:
                extra_args = args[1:] if len(args) > 1 else ()
                cache_key += f":{hashlib.md5(str((extra_args, kwargs)).encode()).hexdigest()}"
            
            # Tentar buscar do cache
            cached_value = await get_cache(cache_key)
            if cached_value is not None:
                logger.debug(f"✅ Cache HIT: {cache_key}")
                return cached_value
            
            # Executar função
            logger.debug(f"❌ Cache MISS: {cache_key}")
            result = await func(*args, **kwargs)
            
            # Salvar no cache
            await set_cache(cache_key, result, ttl=ttl)
            
            return result
        
        return wrapper
    return decorator


async def invalidate_user_cache(user_id: int, prefix: str = "user_cache"):
    """
    Invalidate all cache entries for a specific user
    
    Args:
        user_id: User ID
        prefix: Cache key prefix
    """
    pattern = f"{prefix}:user:{user_id}:*"
    deleted = await delete_pattern(pattern)
    logger.info(f"🗑️ Invalidated {deleted} cache entries for user {user_id}")
    return deleted
