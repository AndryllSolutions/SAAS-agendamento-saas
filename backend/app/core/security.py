"""
Security utilities for authentication and authorization
"""
from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
import bcrypt
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

# Patch bcrypt to safely handle passwords longer than 72 bytes
def _truncate_password(value: bytes) -> bytes:
    """Truncate password bytes to bcrypt's 72-byte limit."""
    if len(value) > 72:
        return value[:72]
    return value


if hasattr(bcrypt, "hashpw"):
    _original_hashpw = bcrypt.hashpw

    def _hashpw_with_trunc(password: bytes, salt: bytes):
        if isinstance(password, str):
            password_bytes = password.encode("utf-8")
        else:
            password_bytes = password
        password_bytes = _truncate_password(password_bytes)
        return _original_hashpw(password_bytes, salt)

    bcrypt.hashpw = _hashpw_with_trunc

if hasattr(bcrypt, "checkpw"):
    _original_checkpw = bcrypt.checkpw

    def _checkpw_with_trunc(password: bytes, hashed_password: bytes):
        if isinstance(password, str):
            password_bytes = password.encode("utf-8")
        else:
            password_bytes = password
        password_bytes = _truncate_password(password_bytes)
        return _original_checkpw(password_bytes, hashed_password)

    bcrypt.checkpw = _checkpw_with_trunc

# Contexto padrão usa apenas argon2 para novos hashes
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto"
)
# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    if not hashed_password:
        return False

    # Hashes padrão (argon2)
    if hashed_password.startswith("$argon2"):
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except ValueError:
            return False

    # Compatibilidade com bcrypt legado
    if hashed_password.startswith("$2"):
        password_bytes = plain_password.encode("utf-8")

        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]

        try:
            return bcrypt.checkpw(password_bytes, hashed_password.encode("utf-8"))
        except ValueError:
            # bcrypt continua lançando ValueError para senhas inválidas
            return False

    # Fallback: tentar verificar com contexto (caso outros formatos válidos)
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False
    

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
    saas_role: Optional[str] = None,
    company_role: Optional[str] = None,
    company_id: Optional[int] = None,
    scope: str = "company"
) -> str:
    """
    Create JWT access token with RBAC context.
    
    Args:
        data: Base token data (must include 'sub' with user_id)
        expires_delta: Optional custom expiration time
        saas_role: Optional SaaS role (SAAS_OWNER, SAAS_STAFF)
        company_role: Optional company role (COMPANY_OWNER, etc.)
        company_id: Optional company ID for company-scoped tokens
        scope: Token scope - "saas" or "company" (default: "company")
    
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Add RBAC fields to token payload
    to_encode.update({
        "exp": expire,
        "type": "access",
        "scope": scope
    })
    
    # Add SaaS role if provided
    if saas_role:
        to_encode["saas_role"] = saas_role
    
    # Add company context if provided
    if company_id:
        to_encode["company_id"] = company_id
    if company_role:
        to_encode["company_role"] = company_role
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt


def decode_token(token: str) -> dict:
    """Decode and verify JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_token(token)
    sub: str = payload.get("sub")
    
    if sub is None:
        raise credentials_exception
    
    # Check if sub is email (string) or user_id (int)
    if "@" in sub:  # Email
        user = db.query(User).filter(User.email == sub).first()
    else:  # User ID
        try:
            user_id = int(sub)
            user = db.query(User).filter(User.id == user_id).first()
        except ValueError:
            user = None
    
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo"
        )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário inativo"
        )
    return current_user


def check_user_permission(user: User, required_role: str) -> bool:
    """Check if user has required role"""
    role_hierarchy = {
        "client": 1,
        "receptionist": 2,
        "professional": 3,
        "finance": 4,
        "manager": 5,
        "owner": 6,
        "saas_admin": 7,
        "admin": 8,  # Legacy support
    }
    
    user_level = role_hierarchy.get(user.role.value if hasattr(user.role, 'value') else user.role, 0)
    required_level = role_hierarchy.get(required_role, 0)
    
    return user_level >= required_level


class RoleChecker:
    """Dependency to check user role"""
    
    def __init__(self, allowed_roles: list):
        # Normalize to uppercase for comparison
        self.allowed_roles = [role.upper() for role in allowed_roles]
    
    def __call__(self, user: User = Depends(get_current_active_user)):
        user_role = user.role.value if hasattr(user.role, 'value') else str(user.role)
        # Normalize to uppercase for comparison
        user_role_upper = user_role.upper()
        if user_role_upper not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permissão insuficiente"
            )
        return user


# Role dependencies (using uppercase to match UserRole enum)
require_saas_admin = RoleChecker(["SAAS_ADMIN"])
require_owner = RoleChecker(["SAAS_ADMIN", "OWNER"])
require_manager = RoleChecker(["SAAS_ADMIN", "OWNER", "MANAGER"])
require_finance = RoleChecker(["SAAS_ADMIN", "OWNER", "MANAGER", "FINANCE"])
require_professional = RoleChecker(["SAAS_ADMIN", "OWNER", "MANAGER", "FINANCE", "PROFESSIONAL"])
require_receptionist = RoleChecker(["SAAS_ADMIN", "OWNER", "MANAGER", "FINANCE", "PROFESSIONAL", "RECEPTIONIST"])
require_client = RoleChecker(["SAAS_ADMIN", "OWNER", "MANAGER", "FINANCE", "PROFESSIONAL", "RECEPTIONIST", "CLIENT"])

# Legacy support
require_admin = require_owner  # Alias for backward compatibility
