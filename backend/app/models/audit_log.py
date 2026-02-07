"""
Audit Log Model - Rastreamento de ações administrativas
"""
from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class AuditLog(Base):
    """
    Modelo para registrar ações administrativas críticas.
    
    Usado para compliance, segurança e auditoria.
    Registra quem fez o quê, quando e de onde.
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    
    # Quem fez a ação
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    user_email = Column(String(255), nullable=False)  # Backup caso user seja deletado
    user_role = Column(String(50))  # Role no momento da ação
    
    # O que foi feito
    action = Column(String(100), nullable=False, index=True)  # Ex: "delete_company", "promote_user"
    resource_type = Column(String(50), nullable=False, index=True)  # Ex: "company", "user"
    resource_id = Column(Integer, nullable=True, index=True)  # ID do recurso afetado
    resource_name = Column(String(255))  # Nome do recurso (backup)
    
    # Detalhes da ação
    details = Column(JSON, nullable=True)  # Dados adicionais (antes/depois, etc)
    description = Column(Text, nullable=True)  # Descrição legível
    
    # Contexto da requisição
    ip_address = Column(String(45), nullable=True)  # IPv4 ou IPv6
    user_agent = Column(String(500), nullable=True)
    request_id = Column(String(100), nullable=True)  # Para correlação com logs
    
    # Status da ação
    status = Column(String(20), default="success")  # success, failed, partial
    error_message = Column(Text, nullable=True)  # Se falhou, por quê
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="audit_logs")

    def __repr__(self):
        return f"<AuditLog(id={self.id}, action={self.action}, user={self.user_email}, created_at={self.created_at})>"


# Ações críticas que DEVEM ser registradas
CRITICAL_ACTIONS = {
    # Empresas
    "delete_company": "Empresa deletada",
    "update_company": "Empresa atualizada",
    "toggle_company_status": "Status da empresa alterado",
    "impersonate_company": "Impersonação de empresa",
    
    # Usuários
    "promote_user_saas": "Usuário promovido a SaaS Admin",
    "delete_user": "Usuário deletado",
    "update_user_role": "Role de usuário alterado",
    
    # Assinaturas
    "update_subscription": "Assinatura alterada",
    "cancel_subscription": "Assinatura cancelada",
    
    # Configurações
    "update_global_settings": "Configurações globais alteradas",
    "update_feature_flags": "Feature flags alteradas",
    
    # Segurança
    "failed_login_attempt": "Tentativa de login falhou",
    "password_reset": "Senha resetada",
    "2fa_disabled": "2FA desabilitado",
}
