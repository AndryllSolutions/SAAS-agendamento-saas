"""
Cache pattern correto para SaaS
PostgreSQL = fonte da verdade
Redis = otimização (nunca fonte primária)
"""
from typing import Optional, Any
import json
import redis
from datetime import timedelta

from app.core.config import settings
from app.core.database import get_db


class CacheService:
    """
    Serviço de cache seguindo padrão correto:
    1. Sempre busca no PostgreSQL primeiro (fonte da verdade)
    2. Redis como otimização apenas
    3. Se Redis falhar, sistema continua funcionando
    """
    
    def __init__(self):
        self.redis_client = None
        try:
            self.redis_client = redis.from_url(settings.get_celery_result_backend)
            # Testar conexão
            self.redis_client.ping()
        except Exception:
            # Redis não disponível = sistema continua sem cache
            self.redis_client = None
    
    def get(self, key: str) -> Optional[Any]:
        """Busca no cache, com fallback para PostgreSQL"""
        if not self.redis_client:
            return None
            
        try:
            value = self.redis_client.get(key)
            if value:
                return json.loads(value)
        except Exception:
            # Erro no Redis = tratar como miss
            pass
        return None
    
    def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """Salva no cache com TTL"""
        if not self.redis_client:
            return False
            
        try:
            serialized = json.dumps(value, default=str)
            return self.redis_client.setex(key, ttl, serialized)
        except Exception:
            # Erro no Redis = ignorar
            return False
    
    def delete(self, key: str) -> bool:
        """Remove do cache"""
        if not self.redis_client:
            return True
            
        try:
            return bool(self.redis_client.delete(key))
        except Exception:
            return False
    
    def invalidate_pattern(self, pattern: str) -> int:
        """Invalida múltiplas chaves por padrão"""
        if not self.redis_client:
            return 0
            
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return self.redis_client.delete(*keys)
        except Exception:
            pass
        return 0


class SubscriptionCache:
    """
    Cache específico para assinaturas
    Segue padrão: PostgreSQL verdade, Redis otimização
    """
    
    def __init__(self):
        self.cache = CacheService()
    
    def get_subscription(self, subscription_id: int) -> Optional[dict]:
        """
        Padrão correto de cache:
        1. Tenta Redis (otimização)
        2. Se não existir, busca PostgreSQL (verdade)
        3. Salva no Redis para próximas consultas
        """
        cache_key = f"subscription:{subscription_id}"
        
        # 1. Tentar cache primeiro
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        # 2. Cache miss = buscar na fonte da verdade
        db = next(get_db())
        try:
            subscription = db.query(Subscription).filter(
                Subscription.id == subscription_id
            ).first()
            
            if not subscription:
                return None
            
            # 3. Converter para dict e salvar no cache
            subscription_dict = {
                "id": subscription.id,
                "customer_id": subscription.customer_id,
                "plan_id": subscription.plan_id,
                "status": subscription.status,
                "is_active": subscription.is_active,
                "current_period_end": subscription.current_period_end.isoformat() if subscription.current_period_end else None,
                "created_at": subscription.created_at.isoformat(),
                "updated_at": subscription.updated_at.isoformat()
            }
            
            # 4. Salvar no cache (otimização para próximas consultas)
            self.cache.set(cache_key, subscription_dict, ttl=1800)  # 30 min
            
            return subscription_dict
            
        finally:
            db.close()
    
    def invalidate_subscription(self, subscription_id: int) -> None:
        """Invalida cache quando assinatura é atualizada"""
        cache_key = f"subscription:{subscription_id}"
        self.cache.delete(cache_key)
        
        # Invalidar caches relacionados
        patterns = [
            f"subscriptions:customer:*",
            f"subscription_limits:{subscription_id}:*",
            f"subscription_features:{subscription_id}:*"
        ]
        
        for pattern in patterns:
            self.cache.invalidate_pattern(pattern)


class RateLimitCache:
    """
    Rate limiting com Redis
    Se Redis falhar = permite request (fail-open)
    """
    
    def __init__(self):
        self.cache = CacheService()
    
    def is_allowed(
        self, 
        key: str, 
        limit: int, 
        window: int = 60
    ) -> tuple[bool, dict]:
        """
        Verifica se request está dentro do limite
        
        Retorna:
        (allowed, info) onde info contém:
        - remaining: requisições restantes
        - reset_time: quando o limite reseta
        """
        if not self.cache.redis_client:
            # Redis indisponível = permitir (fail-open)
            return True, {"remaining": limit, "reset_time": 0}
        
        try:
            current = self.cache.redis_client.incr(key)
            if current == 1:
                # Primeiro request = set TTL
                self.cache.redis_client.expire(key, window)
            
            remaining = max(0, limit - current)
            allowed = current <= limit
            
            return allowed, {
                "remaining": remaining,
                "reset_time": self.cache.redis_client.ttl(key)
            }
            
        except Exception:
            # Erro no Redis = permitir (fail-open)
            return True, {"remaining": limit, "reset_time": 0}


class DistributedLock:
    """
    Lock distribuído com Redis e TTL
    Crítico para evitar concorrência em operações financeiras
    """
    
    def __init__(self):
        self.cache = CacheService()
    
    def acquire(self, key: str, ttl: int = 300) -> bool:
        """
        Adquire lock com TTL obrigatório
        Sempre usar TTL para evitar deadlock eterno
        """
        return self.cache.redis_client and self.cache.redis_client.set(
            key, "locked", ex=ttl, nx=True
        )
    
    def release(self, key: str) -> bool:
        """Libera lock apenas se for o dono"""
        if not self.cache.redis_client:
            return True
            
        # Script Lua para release atômico
        lua_script = """
        if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
        else
            return 0
        end
        """
        
        try:
            return bool(self.cache.redis_client.eval(
                lua_script, 1, key, "locked"
            ))
        except Exception:
            return False
    
    def extend(self, key: str, additional_ttl: int = 300) -> bool:
        """Estende TTL de lock existente"""
        if not self.cache.redis_client:
            return True
            
        try:
            return bool(self.cache.redis_client.expire(key, additional_ttl))
        except Exception:
            return False


# Instâncias globais para uso no aplicativo
subscription_cache = SubscriptionCache()
rate_limit_cache = RateLimitCache()
distributed_lock = DistributedLock()
