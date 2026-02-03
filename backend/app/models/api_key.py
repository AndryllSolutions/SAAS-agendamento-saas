"""
API Key Model - For external API authentication
"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import secrets

from app.models.base import BaseModel


class APIKey(BaseModel):
    """
    API Key model for external integrations
    """
    
    __tablename__ = "api_keys"
    
    # Foreign Keys
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    
    # API Key Info
    name = Column(String(100), nullable=False)  # Nome descritivo (ex: "Integração WhatsApp")
    key_prefix = Column(String(10), nullable=False, index=True)  # Prefixo visível (ex: "ak_live_")
    key_hash = Column(String(255), nullable=False, unique=True, index=True)  # Hash da chave completa
    
    # Permissions & Scope
    scopes = Column(Text, nullable=True)  # JSON string com permissões (ex: ["appointments:read", "clients:write"])
    
    # Status & Expiration
    is_active = Column(Boolean, default=True, nullable=False)
    expires_at = Column(DateTime, nullable=True)  # Null = never expires
    
    # Usage Tracking
    last_used_at = Column(DateTime, nullable=True)
    usage_count = Column(Integer, default=0)
    
    # Metadata
    description = Column(Text, nullable=True)
    ip_whitelist = Column(Text, nullable=True)  # JSON array de IPs permitidos
    
    # Relationships
    company = relationship("Company", back_populates="api_keys")
    user = relationship("User", back_populates="api_keys")
    
    @staticmethod
    def generate_key() -> tuple[str, str]:
        """
        Generate a new API key
        Returns: (full_key, key_hash)
        
        Format: ak_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        """
        # Generate random key (32 bytes = 64 hex chars)
        random_part = secrets.token_hex(32)
        
        # Prefix for identification
        prefix = "ak_live_"
        
        # Full key (what user sees once)
        full_key = f"{prefix}{random_part}"
        
        # Hash for storage (using hashlib)
        import hashlib
        key_hash = hashlib.sha256(full_key.encode()).hexdigest()
        
        return full_key, key_hash
    
    @staticmethod
    def verify_key(provided_key: str, stored_hash: str) -> bool:
        """Verify if provided key matches stored hash"""
        import hashlib
        provided_hash = hashlib.sha256(provided_key.encode()).hexdigest()
        return provided_hash == stored_hash
    
    def is_valid(self) -> bool:
        """Check if API key is valid (active and not expired)"""
        if not self.is_active:
            return False
        
        if self.expires_at and self.expires_at < datetime.utcnow():
            return False
        
        return True
    
    def update_usage(self):
        """Update last used timestamp and increment usage count"""
        self.last_used_at = datetime.utcnow()
        self.usage_count += 1
    
    def has_scope(self, required_scope: str) -> bool:
        """Check if API key has required scope"""
        if not self.scopes:
            return False
        
        import json
        try:
            scopes_list = json.loads(self.scopes)
            
            # Check for wildcard
            if "*" in scopes_list:
                return True
            
            # Check for exact match
            if required_scope in scopes_list:
                return True
            
            # Check for wildcard pattern (ex: "appointments:*")
            resource = required_scope.split(":")[0]
            if f"{resource}:*" in scopes_list:
                return True
            
            return False
        except:
            return False
    
    def __repr__(self):
        return f"<APIKey {self.name} ({self.key_prefix}...) company_id={self.company_id}>"

