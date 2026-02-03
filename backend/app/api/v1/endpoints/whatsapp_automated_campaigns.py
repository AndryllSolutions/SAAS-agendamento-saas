"""
WhatsApp Automated Campaigns Endpoints
APIs para gerenciar campanhas automáticas de WhatsApp
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_manager
from app.models.user import User
from app.models.company import Company
from app.models.whatsapp_automated_campaigns import (
    WhatsAppAutomatedCampaign,
    AutomatedCampaignType
)
from app.schemas.whatsapp_automated_campaigns import (
    WhatsAppAutomatedCampaignCreate,
    WhatsAppAutomatedCampaignUpdate,
    WhatsAppAutomatedCampaignResponse,
    WhatsAppAutomatedCampaignInfo
)

router = APIRouter()


# Metadados das campanhas automáticas (hardcoded - configuração do sistema)
AUTOMATED_CAMPAIGNS_METADATA = {
    AutomatedCampaignType.BIRTHDAY: {
        "name": "Parabenize seus clientes",
        "description": "Envie mensagens automáticas de aniversário para seus clientes",
        "default_template": "🎉 Feliz aniversário, {nome_cliente}! 🎂\n\nA equipe da {nome_empresa} deseja um dia maravilhoso! 🎈",
        "available_variables": ["nome_cliente", "nome_empresa", "telefone", "endereco"],
        "config_fields": {
            "send_hour": "Horário de envio (HH:MM)",
            "include_offer": "Incluir oferta especial"
        }
    },
    AutomatedCampaignType.RECONQUER: {
        "name": "Reconquiste clientes",
        "description": "Envie mensagens para clientes inativos há muito tempo",
        "default_template": "Olá {nome_cliente}! 😊\n\nSentimos sua falta na {nome_empresa}! Que tal agendar um horário? Temos novidades esperando por você! 💆‍♀️",
        "available_variables": ["nome_cliente", "nome_empresa", "dias_inativo", "link_agendamento", "telefone"],
        "config_fields": {
            "days_inactive": "Dias de inatividade",
            "include_discount": "Incluir desconto"
        }
    },
    AutomatedCampaignType.REMINDER: {
        "name": "Evite esquecimentos",
        "description": "Lembre seus clientes sobre agendamentos confirmados",
        "default_template": "Olá %NOME%! 📅\n\nLembramos que você tem um agendamento marcado:\n\n🕐 %DATA% às %HORA%\n💆‍♀️ %SERVICO%\n👤 Com %PROFISSIONAL%\n\nNos vemos em breve!",
        "available_variables": ["%NOME%", "%DATA%", "%HORA%", "%SERVICO%", "%PROFISSIONAL%", "%LINK%"],
        "config_fields": {
            "hours_before": "Horas de antecedência",
            "send_multiple": "Enviar múltiplos lembretes"
        }
    },
    AutomatedCampaignType.PRE_CARE: {
        "name": "Cuidados pré-atendimento",
        "description": "Envie instruções antes do atendimento",
        "default_template": "Olá {nome_cliente}! 👋\n\nPara garantir o melhor resultado no seu {servico}, recomendamos:\n\n✅ Chegar 10 minutos antes\n✅ Cabelos limpos e secos\n✅ Evitar produtos antes do procedimento\n\nNos vemos em breve! 💆‍♀️",
        "available_variables": ["nome_cliente", "servico", "data_agendamento", "hora_agendamento", "profissional", "nome_empresa"],
        "config_fields": {
            "hours_before": "Horas antes do atendimento",
            "service_specific": "Mensagens específicas por serviço"
        }
    },
    AutomatedCampaignType.POST_CARE: {
        "name": "Cuidados pós-atendimento",
        "description": "Envie instruções após o atendimento",
        "default_template": "Olá {nome_cliente}! ✨\n\nObrigado por escolher a {nome_empresa}!\n\nPara manter os resultados do seu {servico}:\n\n💧 Hidrate bem\n🌞 Use protetor solar\n⏰ Retorne em 30 dias\n\nConte sempre conosco! 💆‍♀️",
        "available_variables": ["nome_cliente", "servico", "profissional", "nome_empresa", "link_agendamento", "telefone"],
        "config_fields": {
            "hours_after": "Horas após o atendimento",
            "service_specific": "Mensagens específicas por serviço"
        }
    },
    AutomatedCampaignType.RETURN_GUARANTEE: {
        "name": "Garanta retornos",
        "description": "Ative campanhas para sugerir novos agendamentos.",
        "default_template": "Seu servico %SERVICO% esta disponivel novamente.",
        "available_variables": ["%NOME%", "%SERVICO%", "%PROFISSIONAL%", "%LINK%"],
        "config_fields": {
            "days_after_service": "Dias após último serviço",
            "service_ids": "Serviços específicos"
        }
    },
    AutomatedCampaignType.STATUS_UPDATE: {
        "name": "Clientes bem informados",
        "description": "Notifique mudancas de status e entregue tranquilidade.",
        "default_template": "Seu agendamento foi %STATUS%.",
        "available_variables": ["%NOME%", "%DATA%", "%HORA%", "%STATUS%"],
        "config_fields": {
            "notify_confirmed": "Notificar quando confirmado",
            "notify_cancelled": "Notificar quando cancelado",
            "notify_completed": "Notificar quando concluído"
        }
    },
    AutomatedCampaignType.WELCOME: {
        "name": "Boas-vindas",
        "description": "Encante no primeiro contato com uma mensagem personalizada.",
        "default_template": "Bem-vindo, %NOME%! Estamos prontos para te atender.",
        "available_variables": ["%NOME%", "%APELIDO%", "%SERVICO%", "%PROFISSIONAL%"],
        "config_fields": {
            "days_after": "Dias após primeira compra",
            "include_discount": "Incluir cupom de desconto"
        }
    },
    AutomatedCampaignType.INVITE_ONLINE: {
        "name": "Convide para agendar online",
        "description": "Incentive clientes a usarem o agendamento online",
        "default_template": "Olá {nome_cliente}! 📱\n\nAgora você pode agendar seus horários online, de forma rápida e fácil!\n\n🔗 {link_agendamento}\n\nExperimente e aproveite a praticidade! 😊",
        "available_variables": ["nome_cliente", "nome_empresa", "link_agendamento", "telefone"],
        "config_fields": {
            "days_after_register": "Dias após cadastro",
            "only_non_online_users": "Apenas quem nunca agendou online"
        }
    },
    AutomatedCampaignType.CASHBACK: {
        "name": "Cashback",
        "description": "Notifique sobre atualizações de saldo de cashback",
        "default_template": "Olá {nome_cliente}! 💰\n\nVocê acumulou cashback!\n\nSaldo atual: R$ {saldo_cashback}\n\nUse em sua próxima visita à {nome_empresa}! 😊",
        "available_variables": ["nome_cliente", "saldo_cashback", "nome_empresa", "link_agendamento", "telefone"],
        "config_fields": {
            "min_balance": "Saldo mínimo para notificar",
            "notify_on_update": "Notificar a cada atualização"
        }
    },
    AutomatedCampaignType.PACKAGE_EXPIRING: {
        "name": "Pacote expirando",
        "description": "Avise sobre pacotes próximos do vencimento",
        "default_template": "Olá {nome_cliente}! ⚠️\n\nSeu pacote está próximo do vencimento:\n\n📦 Vencimento: {data_vencimento}\n⏰ Agende logo para não perder!\n\n{link_agendamento}",
        "available_variables": ["nome_cliente", "data_vencimento", "nome_empresa", "link_agendamento", "telefone"],
        "config_fields": {
            "days_before": "Dias antes do vencimento",
            "send_reminder": "Enviar lembrete adicional"
        }
    },
    AutomatedCampaignType.BILLING: {
        "name": "Realize cobranças",
        "description": "Envie lembretes de faturas em aberto",
        "default_template": "Olá {nome_cliente}! 💳\n\nVocê tem uma fatura em aberto:\n\n💰 Valor: R$ {valor_fatura}\n📅 Vencimento: {data_vencimento}\n\nPague agora e evite juros! 😊",
        "available_variables": ["nome_cliente", "valor_fatura", "data_vencimento", "nome_empresa", "telefone"],
        "config_fields": {
            "days_overdue": "Dias após vencimento",
            "send_multiple": "Enviar múltiplos lembretes"
        }
    }
}


@router.get("/automated-campaigns", response_model=List[WhatsAppAutomatedCampaignInfo])
def list_automated_campaigns(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """
    Lista todas as campanhas automáticas disponíveis.
    Retorna as configuradas pela empresa + as disponíveis no sistema.
    """
    company_id = current_user.company_id
    
    # Buscar campanhas já configuradas pela empresa
    configured_campaigns = db.query(WhatsAppAutomatedCampaign).filter(
        WhatsAppAutomatedCampaign.company_id == company_id
    ).all()
    
    # Criar dicionário de campanhas configuradas
    configured_dict = {camp.campaign_type: camp for camp in configured_campaigns}
    
    # Montar lista completa com metadados
    result = []
    for campaign_type, metadata in AUTOMATED_CAMPAIGNS_METADATA.items():
        configured = configured_dict.get(campaign_type)
        
        campaign_info = WhatsAppAutomatedCampaignInfo(
            id=configured.id if configured else None,
            campaign_type=campaign_type,
            name=metadata["name"],
            description=metadata["description"],
            is_enabled=configured.is_enabled if configured else False,
            is_configured=configured.is_configured if configured else configured is not None,
            config=configured.config if configured else None,
            message_template=configured.message_template if configured else None,
            default_message_template=metadata["default_template"],
            available_variables=metadata["available_variables"],
            filters=configured.filters if configured else None,
            send_time_start=configured.send_time_start if configured else "09:00",
            send_time_end=configured.send_time_end if configured else "18:00",
            send_weekdays_only=configured.send_weekdays_only if configured else True,
            total_triggered=configured.total_triggered if configured else 0,
            total_sent=configured.total_sent if configured else 0,
            total_failed=configured.total_failed if configured else 0
        )
        result.append(campaign_info)
    
    return result


@router.get("/automated-campaigns/{campaign_type}", response_model=WhatsAppAutomatedCampaignInfo)
def get_automated_campaign(
    campaign_type: AutomatedCampaignType,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """
    Obtém detalhes de uma campanha automática específica.
    """
    company_id = current_user.company_id
    
    # Verificar se campanha existe nos metadados
    if campaign_type not in AUTOMATED_CAMPAIGNS_METADATA:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tipo de campanha não encontrado"
        )
    
    metadata = AUTOMATED_CAMPAIGNS_METADATA[campaign_type]
    
    # Buscar configuração da empresa
    configured = db.query(WhatsAppAutomatedCampaign).filter(
        WhatsAppAutomatedCampaign.company_id == company_id,
        WhatsAppAutomatedCampaign.campaign_type == campaign_type
    ).first()
    
    campaign_info = WhatsAppAutomatedCampaignInfo(
        id=configured.id if configured else None,
        campaign_type=campaign_type,
        name=metadata["name"],
        description=metadata["description"],
        is_enabled=configured.is_enabled if configured else False,
        is_configured=configured.is_configured if configured else configured is not None,
        config=configured.config if configured else None,
        message_template=configured.message_template if configured else None,
        default_message_template=metadata["default_template"],
        available_variables=metadata["available_variables"],
        filters=configured.filters if configured else None,
        send_time_start=configured.send_time_start if configured else "09:00",
        send_time_end=configured.send_time_end if configured else "18:00",
        send_weekdays_only=configured.send_weekdays_only if configured else True,
        total_triggered=configured.total_triggered if configured else 0,
        total_sent=configured.total_sent if configured else 0,
        total_failed=configured.total_failed if configured else 0
    )
    
    return campaign_info


@router.post("/automated-campaigns/{campaign_type}/toggle", response_model=WhatsAppAutomatedCampaignResponse)
def toggle_automated_campaign(
    campaign_type: AutomatedCampaignType,
    enabled: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """
    Ativa ou desativa uma campanha automática.
    Cria a configuração se não existir.
    """
    company_id = current_user.company_id
    
    # Verificar se campanha existe nos metadados
    if campaign_type not in AUTOMATED_CAMPAIGNS_METADATA:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tipo de campanha não encontrado"
        )
    
    # Buscar ou criar configuração
    campaign = db.query(WhatsAppAutomatedCampaign).filter(
        WhatsAppAutomatedCampaign.company_id == company_id,
        WhatsAppAutomatedCampaign.campaign_type == campaign_type
    ).first()
    
    if not campaign:
        # Criar nova configuração
        metadata = AUTOMATED_CAMPAIGNS_METADATA[campaign_type]
        campaign = WhatsAppAutomatedCampaign(
            company_id=company_id,
            campaign_type=campaign_type,
            is_enabled=enabled,
            is_configured=True,
            message_template=metadata["default_template"]
        )
        db.add(campaign)
    else:
        # Atualizar existente
        campaign.is_enabled = enabled
        campaign.is_configured = True
    
    db.commit()
    db.refresh(campaign)
    
    return campaign


@router.put("/automated-campaigns/{campaign_type}", response_model=WhatsAppAutomatedCampaignResponse)
def update_automated_campaign(
    campaign_type: AutomatedCampaignType,
    data: WhatsAppAutomatedCampaignUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """
    Atualiza a configuração de uma campanha automática.
    """
    company_id = current_user.company_id
    
    # Buscar campanha
    campaign = db.query(WhatsAppAutomatedCampaign).filter(
        WhatsAppAutomatedCampaign.company_id == company_id,
        WhatsAppAutomatedCampaign.campaign_type == campaign_type
    ).first()
    
    if not campaign:
        # Criar se não existir
        metadata = AUTOMATED_CAMPAIGNS_METADATA.get(campaign_type)
        if not metadata:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tipo de campanha não encontrado"
            )
        
        campaign = WhatsAppAutomatedCampaign(
            company_id=company_id,
            campaign_type=campaign_type,
            is_configured=True,
            message_template=metadata["default_template"]
        )
        db.add(campaign)
    
    # Atualizar campos
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(campaign, field, value)
    
    # Se houve atualização, marca como configurado
    if update_data:
        campaign.is_configured = True
    
    db.commit()
    db.refresh(campaign)
    
    return campaign


@router.post("/automated-campaigns/{campaign_type}/reset", response_model=WhatsAppAutomatedCampaignResponse)
def reset_automated_campaign(
    campaign_type: AutomatedCampaignType,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """
    Reseta uma campanha automática para as configurações padrão.
    """
    company_id = current_user.company_id
    
    # Verificar se campanha existe nos metadados
    if campaign_type not in AUTOMATED_CAMPAIGNS_METADATA:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tipo de campanha não encontrado"
        )
    
    metadata = AUTOMATED_CAMPAIGNS_METADATA[campaign_type]
    
    # Buscar campanha
    campaign = db.query(WhatsAppAutomatedCampaign).filter(
        WhatsAppAutomatedCampaign.company_id == company_id,
        WhatsAppAutomatedCampaign.campaign_type == campaign_type
    ).first()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campanha não configurada"
        )
    
    # Resetar para padrão
    campaign.message_template = metadata["default_template"]
    campaign.config = None
    campaign.filters = None
    campaign.send_time_start = "09:00"
    campaign.send_time_end = "18:00"
    campaign.send_weekdays_only = True
    campaign.is_configured = True
    
    db.commit()
    db.refresh(campaign)
    
    return campaign


@router.get("/automated-campaigns/{campaign_type}/stats")
def get_campaign_stats(
    campaign_type: AutomatedCampaignType,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """
    Obtém estatísticas de uma campanha automática.
    """
    company_id = current_user.company_id
    
    campaign = db.query(WhatsAppAutomatedCampaign).filter(
        WhatsAppAutomatedCampaign.company_id == company_id,
        WhatsAppAutomatedCampaign.campaign_type == campaign_type
    ).first()
    
    if not campaign:
        return {
            "total_triggered": 0,
            "total_sent": 0,
            "total_failed": 0,
            "success_rate": 0
        }
    
    success_rate = 0
    if campaign.total_triggered > 0:
        success_rate = (campaign.total_sent / campaign.total_triggered) * 100
    
    return {
        "total_triggered": campaign.total_triggered,
        "total_sent": campaign.total_sent,
        "total_failed": campaign.total_failed,
        "success_rate": round(success_rate, 2)
    }


@router.delete("/automated-campaigns/{campaign_type}", status_code=status.HTTP_204_NO_CONTENT)
def delete_automated_campaign(
    campaign_type: AutomatedCampaignType,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """
    Deleta uma campanha automática.
    
    ⚠️ ATENÇÃO: Esta ação é irreversível e removerá todas as configurações da campanha.
    """
    company_id = current_user.company_id
    
    campaign = db.query(WhatsAppAutomatedCampaign).filter(
        WhatsAppAutomatedCampaign.company_id == company_id,
        WhatsAppAutomatedCampaign.campaign_type == campaign_type
    ).first()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campanha não encontrada"
        )
    
    # Verificar se há campanhas ativas ou recentes antes de permitir exclusão
    from app.models.whatsapp_marketing import WhatsAppCampaign
    active_campaigns = db.query(WhatsAppCampaign).filter(
        WhatsAppCampaign.company_id == company_id,
        WhatsAppCampaign.campaign_type == campaign_type.value,
        WhatsAppCampaign.status.in_(["scheduled", "sending"])
    ).count()
    
    if active_campaigns > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível deletar campanha com envios ativos ou agendados"
        )
    
    # Deletar a campanha automática
    db.delete(campaign)
    db.commit()
    
    return None
