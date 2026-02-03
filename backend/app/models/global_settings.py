"""
Global Settings Model - Configurações globais do sistema SaaS
"""
from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

from app.models.base import BaseModel


class GlobalSettings(BaseModel):
    """
    Configurações globais do sistema SaaS
    
    Armazena configurações que afetam toda a plataforma:
    - Configurações de manutenção
    - Limites globais
    - Configurações de notificações
    - Configurações de segurança
    - Configurações de integração
    """
    
    __tablename__ = "global_settings"
    
    # Identificação única
    key = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)  # maintenance, security, notifications, etc.
    
    # Dados da configuração
    value = Column(Text, nullable=True)  # Valor como texto (JSON, string, número)
    value_type = Column(String(20), nullable=False, default="string")  # string, number, boolean, json
    description = Column(Text, nullable=True)  # Descrição da configuração
    
    # Metadados
    is_active = Column(Boolean, default=True, nullable=False)
    is_public = Column(Boolean, default=False, nullable=False)  # Se pode ser acessada publicamente
    requires_restart = Column(Boolean, default=False, nullable=False)  # Se requer restart do servidor
    
    # Auditoria
    updated_by = Column(Integer, nullable=True)  # ID do usuário que atualizou
    updated_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<GlobalSettings {self.key}={self.value}>"
    
    @property
    def parsed_value(self):
        """Parse do valor baseado no tipo"""
        if self.value_type == "boolean":
            return self.value.lower() in ("true", "1", "yes", "on")
        elif self.value_type == "number":
            try:
                return float(self.value)
            except (ValueError, TypeError):
                return 0
        elif self.value_type == "json":
            import json
            try:
                return json.loads(self.value) if self.value else {}
            except (ValueError, TypeError):
                return {}
        else:
            return self.value
    
    @parsed_value.setter
    def parsed_value(self, value):
        """Define o valor baseado no tipo"""
        if self.value_type == "boolean":
            self.value = "true" if value else "false"
        elif self.value_type == "number":
            self.value = str(value)
        elif self.value_type == "json":
            import json
            self.value = json.dumps(value) if value is not None else "{}"
        else:
            self.value = str(value) if value is not None else ""