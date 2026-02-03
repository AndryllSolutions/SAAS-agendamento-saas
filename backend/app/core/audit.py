"""
Audit Helper - Facilita o registro de ações administrativas
"""
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import Request

from app.models.audit_log import AuditLog, CRITICAL_ACTIONS
from app.core.rbac import CurrentUserContext


def log_action(
    db: Session,
    action: str,
    resource_type: str,
    context: CurrentUserContext,
    request: Optional[Request] = None,
    resource_id: Optional[int] = None,
    resource_name: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    status: str = "success",
    error_message: Optional[str] = None
) -> AuditLog:
    """
    Registra uma ação administrativa no audit log.
    
    Args:
        db: Sessão do banco de dados
        action: Ação realizada (ex: "delete_company")
        resource_type: Tipo do recurso (ex: "company")
        context: Contexto do usuário atual
        request: Request do FastAPI (para pegar IP e User-Agent)
        resource_id: ID do recurso afetado
        resource_name: Nome do recurso (backup)
        details: Detalhes adicionais da ação
        status: Status da ação (success, failed, partial)
        error_message: Mensagem de erro se falhou
    
    Returns:
        AuditLog criado
    """
    # Extrair informações do request
    ip_address = None
    user_agent = None
    request_id = None
    
    if request:
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
        request_id = request.state.request_id if hasattr(request.state, "request_id") else None
    
    # Criar descrição legível
    description = CRITICAL_ACTIONS.get(action, f"Ação: {action}")
    if resource_name:
        description = f"{description}: {resource_name}"
    
    # Criar audit log
    audit = AuditLog(
        user_id=context.user_id,
        user_email=context.email,
        user_role=context.saas_role or context.company_role,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        resource_name=resource_name,
        details=details,
        description=description,
        ip_address=ip_address,
        user_agent=user_agent,
        request_id=request_id,
        status=status,
        error_message=error_message
    )
    
    db.add(audit)
    db.commit()
    db.refresh(audit)
    
    return audit


def log_impersonation(
    db: Session,
    context: CurrentUserContext,
    request: Request,
    company_id: int,
    company_name: str
) -> AuditLog:
    """
    Registra uma impersonação de empresa.
    
    CRÍTICO: Toda impersonação DEVE ser registrada para auditoria.
    """
    return log_action(
        db=db,
        action="impersonate_company",
        resource_type="company",
        context=context,
        request=request,
        resource_id=company_id,
        resource_name=company_name,
        details={
            "admin_email": context.email,
            "admin_role": context.saas_role,
            "company_id": company_id,
            "company_name": company_name
        }
    )


def log_company_deletion(
    db: Session,
    context: CurrentUserContext,
    request: Request,
    company_id: int,
    company_name: str,
    company_data: Dict[str, Any]
) -> AuditLog:
    """
    Registra deleção de empresa.
    
    CRÍTICO: Salva snapshot completo da empresa antes de deletar.
    """
    return log_action(
        db=db,
        action="delete_company",
        resource_type="company",
        context=context,
        request=request,
        resource_id=company_id,
        resource_name=company_name,
        details={
            "company_snapshot": company_data,
            "deleted_by": context.email
        }
    )


def log_user_promotion(
    db: Session,
    context: CurrentUserContext,
    request: Request,
    user_id: int,
    user_email: str,
    old_role: Optional[str],
    new_role: str
) -> AuditLog:
    """
    Registra promoção de usuário a SaaS Admin.
    
    CRÍTICO: Mudanças de permissão devem ser auditadas.
    """
    return log_action(
        db=db,
        action="promote_user_saas",
        resource_type="user",
        context=context,
        request=request,
        resource_id=user_id,
        resource_name=user_email,
        details={
            "user_email": user_email,
            "old_role": old_role,
            "new_role": new_role,
            "promoted_by": context.email
        }
    )


def log_subscription_change(
    db: Session,
    context: CurrentUserContext,
    request: Request,
    company_id: int,
    company_name: str,
    old_plan: Optional[str],
    new_plan: str,
    trial_days: Optional[int] = None
) -> AuditLog:
    """
    Registra mudança de assinatura.
    """
    return log_action(
        db=db,
        action="update_subscription",
        resource_type="subscription",
        context=context,
        request=request,
        resource_id=company_id,
        resource_name=company_name,
        details={
            "company_id": company_id,
            "company_name": company_name,
            "old_plan": old_plan,
            "new_plan": new_plan,
            "trial_days": trial_days,
            "changed_by": context.email
        }
    )


def log_company_status_change(
    db: Session,
    context: CurrentUserContext,
    request: Request,
    company_id: int,
    company_name: str,
    old_status: bool,
    new_status: bool
) -> AuditLog:
    """
    Registra ativação/desativação de empresa.
    """
    return log_action(
        db=db,
        action="toggle_company_status",
        resource_type="company",
        context=context,
        request=request,
        resource_id=company_id,
        resource_name=company_name,
        details={
            "company_id": company_id,
            "company_name": company_name,
            "old_status": "active" if old_status else "inactive",
            "new_status": "active" if new_status else "inactive",
            "changed_by": context.email
        }
    )
