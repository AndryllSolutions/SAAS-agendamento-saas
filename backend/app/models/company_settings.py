"""
Company Settings Model - For storing notification credentials and other company-specific settings
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship
from cryptography.fernet import Fernet
import os
import json
from typing import Dict, Any, Optional

from app.models.base import BaseModel


class CompanySettings(BaseModel):
    """Company settings model for storing encrypted notification credentials"""
    
    __tablename__ = "company_settings"
    
    # Foreign Key
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # Notification Settings (Encrypted JSON)
    email_config = Column(Text, nullable=True)  # Encrypted SMTP settings
    sms_config = Column(Text, nullable=True)    # Encrypted Twilio settings
    whatsapp_config = Column(Text, nullable=True)  # Encrypted WhatsApp settings
    vapid_config = Column(Text, nullable=True)  # Encrypted VAPID settings
    
    # General Settings (Plain JSON - not sensitive)
    general_settings = Column(JSON, nullable=True)  # Business hours, timezone, etc.
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Relationships
    company = relationship("Company", back_populates="settings_obj", uselist=False)
    
    @staticmethod
    def get_encryption_key() -> bytes:
        """Get encryption key from environment or generate one"""
        key = os.environ.get('SETTINGS_ENCRYPTION_KEY')
        if not key:
            # For development, generate a key (in production, this should be set in env)
            key = Fernet.generate_key().decode()
            print(f"⚠️  Generated encryption key (set in env): {key}")
        return key.encode() if isinstance(key, str) else key
    
    @staticmethod
    def encrypt_data(data: Dict[str, Any]) -> str:
        """Encrypt sensitive data"""
        if not data:
            return None
        
        fernet = Fernet(CompanySettings.get_encryption_key())
        json_data = json.dumps(data)
        encrypted_data = fernet.encrypt(json_data.encode())
        return encrypted_data.decode()
    
    @staticmethod
    def decrypt_data(encrypted_data: str) -> Optional[Dict[str, Any]]:
        """Decrypt sensitive data"""
        if not encrypted_data:
            return None
        
        try:
            fernet = Fernet(CompanySettings.get_encryption_key())
            decrypted_data = fernet.decrypt(encrypted_data.encode())
            return json.loads(decrypted_data.decode())
        except Exception as e:
            print(f"Error decrypting data: {e}")
            return None
    
    def get_email_config(self) -> Optional[Dict[str, Any]]:
        """Get decrypted email configuration"""
        return self.decrypt_data(self.email_config)
    
    def set_email_config(self, config: Dict[str, Any]):
        """Set encrypted email configuration"""
        self.email_config = self.encrypt_data(config)
    
    def get_sms_config(self) -> Optional[Dict[str, Any]]:
        """Get decrypted SMS configuration"""
        return self.decrypt_data(self.sms_config)
    
    def set_sms_config(self, config: Dict[str, Any]):
        """Set encrypted SMS configuration"""
        self.sms_config = self.encrypt_data(config)
    
    def get_whatsapp_config(self) -> Optional[Dict[str, Any]]:
        """Get decrypted WhatsApp configuration"""
        return self.decrypt_data(self.whatsapp_config)
    
    def set_whatsapp_config(self, config: Dict[str, Any]):
        """Set encrypted WhatsApp configuration"""
        self.whatsapp_config = self.encrypt_data(config)
    
    def get_vapid_config(self) -> Optional[Dict[str, Any]]:
        """Get decrypted VAPID configuration"""
        return self.decrypt_data(self.vapid_config)
    
    def set_vapid_config(self, config: Dict[str, Any]):
        """Set encrypted VAPID configuration"""
        self.vapid_config = self.encrypt_data(config)
    
    def get_all_notification_configs(self) -> Dict[str, Any]:
        """Get all decrypted notification configurations"""
        return {
            'smtp': self.get_email_config() or {},
            'twilio': self.get_sms_config() or {},
            'whatsapp': self.get_whatsapp_config() or {},
            'vapid': self.get_vapid_config() or {}
        }
    
    def set_all_notification_configs(self, configs: Dict[str, Any]):
        """Set all encrypted notification configurations"""
        if 'smtp' in configs:
            self.set_email_config(configs['smtp'])
        if 'twilio' in configs:
            self.set_sms_config(configs['twilio'])
        if 'whatsapp' in configs:
            self.set_whatsapp_config(configs['whatsapp'])
        if 'vapid' in configs:
            self.set_vapid_config(configs['vapid'])
    
    def __repr__(self):
        return f"<CompanySettings company_id={self.company_id}>"
