"""
Performance optimization utilities
"""
from functools import wraps
from typing import Callable, Any
from sqlalchemy.orm import Session, Query
from sqlalchemy.orm import joinedload, selectinload
from app.core.cache import get_cache, set_cache, delete_cache_pattern


def cache_list_result(
    expire: int = 120,
    key_prefix: str = "list",
    invalidate_on_create: bool = True,
    invalidate_on_update: bool = True,
    invalidate_on_delete: bool = True
):
    """
    Decorator to cache list endpoint results
    
    Args:
        expire: Cache expiration in seconds (default 2 minutes)
        key_prefix: Prefix for cache key
        invalidate_on_create: Invalidate cache on create operations
        invalidate_on_update: Invalidate cache on update operations
        invalidate_on_delete: Invalidate cache on delete operations
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract current_user and company_id from kwargs
            current_user = kwargs.get('current_user')
            if not current_user:
                # Try to find in args
                for arg in args:
                    if hasattr(arg, 'company_id'):
                        current_user = arg
                        break
            
            if not current_user:
                return await func(*args, **kwargs)
            
            # Generate cache key
            cache_key_parts = [
                key_prefix,
                func.__name__,
                str(current_user.company_id),
                str(kwargs.get('skip', 0)),
                str(kwargs.get('limit', 100)),
            ]
            
            # Add filter parameters to cache key
            for key in ['search', 'status', 'is_active', 'category_id', 'brand_id']:
                if key in kwargs and kwargs[key] is not None:
                    cache_key_parts.append(f"{key}:{kwargs[key]}")
            
            cache_key = ":".join(cache_key_parts)
            
            # Try cache first (only for first page without search)
            if kwargs.get('skip', 0) == 0 and not kwargs.get('search'):
                cached = await get_cache(cache_key)
                if cached:
                    return cached
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Cache result (only for first page without search)
            if kwargs.get('skip', 0) == 0 and not kwargs.get('search'):
                await set_cache(cache_key, result, ttl=expire)
            
            return result
        return wrapper
    return decorator


def optimize_query_with_relationships(
    query: Query,
    relationships: list[str]
) -> Query:
    """
    Optimize query by eager loading relationships
    
    Args:
        query: SQLAlchemy query object
        relationships: List of relationship names to eager load
    
    Returns:
        Optimized query
    """
    for rel_name in relationships:
        try:
            # Get relationship attribute
            rel = getattr(query.column_descriptions[0]['type'], rel_name, None)
            if rel:
                # Use selectinload for one-to-many and many-to-many
                # Use joinedload for many-to-one and one-to-one
                if hasattr(rel.property, 'direction'):
                    if rel.property.direction.name in ['ONETOMANY', 'MANYTOMANY']:
                        query = query.options(selectinload(getattr(query.column_descriptions[0]['type'], rel_name)))
                    else:
                        query = query.options(joinedload(getattr(query.column_descriptions[0]['type'], rel_name)))
        except Exception:
            # If relationship doesn't exist, skip it
            continue
    
    return query


def invalidate_cache_pattern(pattern: str):
    """
    Decorator to invalidate cache pattern after mutations
    
    Args:
        pattern: Cache key pattern to invalidate (e.g., "clients:list:{company_id}:*")
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Execute function
            result = await func(*args, **kwargs)
            
            # Extract current_user
            current_user = kwargs.get('current_user')
            if not current_user:
                for arg in args:
                    if hasattr(arg, 'company_id'):
                        current_user = arg
                        break
            
            if current_user:
                # Replace {company_id} placeholder in pattern
                cache_pattern = pattern.replace('{company_id}', str(current_user.company_id))
                delete_cache_pattern(cache_pattern)
            
            return result
        return wrapper
    return decorator

