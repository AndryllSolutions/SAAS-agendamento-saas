"""
Serviço de Notificações de Agendamento com Templates Profissionais
"""
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from app.services.notification_service import NotificationService
from app.models.notification import NotificationType
from app.models.company_settings import CompanySettings
from app.templates.email_templates import get_appointment_confirmation_template


class AppointmentNotificationService:
    """Serviço para enviar notificações profissionais de agendamento"""
    
    @staticmethod
    def send_booking_confirmation(
        db: Session,
        client_name: str,
        client_email: Optional[str],
        client_phone: Optional[str],
        service_name: str,
        professional_name: str,
        start_time: datetime,
        company_name: str,
        company_id: Optional[int] = None,
        check_in_code: Optional[str] = None,
        user_id: Optional[int] = None
    ) -> bool:
        """
        Envia confirmação de agendamento profissional via email
        
        Args:
            db: Sessão do banco de dados
            client_name: Nome do cliente
            client_email: Email do cliente
            client_phone: Telefone do cliente
            service_name: Nome do serviço
            professional_name: Nome do profissional
            start_time: Data/hora do agendamento
            company_name: Nome da empresa
            company_id: ID da empresa (opcional, para pegar dados adicionais)
            check_in_code: Código de check-in (opcional)
            user_id: ID do usuário (opcional, para criar notificação)
            
        Returns:
            bool: True se enviado com sucesso
        """
        
        # Buscar informações adicionais da empresa se disponível
        company_address = None
        company_phone = None
        
        if company_id:
            try:
                from app.models.company import Company
                company = db.query(Company).filter(Company.id == company_id).first()
                if company:
                    company_address = company.address
                    company_phone = company.phone
            except Exception as e:
                print(f"⚠️ Erro ao buscar dados da empresa: {e}")
        
        # EMAIL
        if client_email:
            try:
                # Gerar template HTML profissional
                html_body, plain_text = get_appointment_confirmation_template(
                    client_name=client_name,
                    service_name=service_name,
                    professional_name=professional_name,
                    start_time=start_time,
                    company_name=company_name,
                    company_address=company_address,
                    company_phone=company_phone,
                    check_in_code=check_in_code
                )
                
                # Assunto do email
                date_str = start_time.strftime("%d/%m/%Y")
                subject = f"✅ Agendamento Confirmado - {service_name} em {date_str}"
                
                # Buscar configuração SMTP da empresa
                if company_id:
                    settings_obj = db.query(CompanySettings).filter(
                        CompanySettings.company_id == company_id
                    ).first()
                    
                    if settings_obj:
                        email_config = settings_obj.get_email_config()
                        if email_config:
                            # Usar SMTP configurado da empresa
                            NotificationService.send_email_with_config(
                                to_email=client_email,
                                subject=subject,
                                body=plain_text,
                                html_body=html_body,
                                smtp_config=email_config
                            )
                        else:
                            # Usar SMTP padrão do sistema
                            NotificationService.send_email(
                                to_email=client_email,
                                subject=subject,
                                body=plain_text,
                                html_body=html_body
                            )
                    else:
                        # Usar SMTP padrão do sistema
                        NotificationService.send_email(
                            to_email=client_email,
                            subject=subject,
                            body=plain_text,
                            html_body=html_body
                        )
                else:
                    # Sem company_id, usar SMTP padrão
                    NotificationService.send_email(
                        to_email=client_email,
                        subject=subject,
                        body=plain_text,
                        html_body=html_body
                    )
                
                print(f"✅ Email de confirmação enviado para {client_email}")
                
                # Criar notificação no banco se user_id fornecido
                if user_id:
                    try:
                        from app.models.notification import Notification, NotificationStatus
                        notification = Notification(
                            user_id=user_id,
                            notification_type=NotificationType.EMAIL,
                            title="Agendamento Confirmado",
                            message=f"Seu agendamento de {service_name} foi confirmado para {start_time.strftime('%d/%m/%Y às %H:%M')}",
                            recipient=client_email,
                            status=NotificationStatus.SENT
                        )
                        db.add(notification)
                        db.commit()
                    except Exception as e:
                        print(f"⚠️ Erro ao criar notificação no banco: {e}")
                        db.rollback()
                
                return True
                
            except Exception as e:
                print(f"❌ Erro ao enviar email de confirmação: {e}")
                import traceback
                traceback.print_exc()
                return False
        
        # WHATSAPP (futuro)
        if client_phone:
            try:
                # TODO: Implementar envio via WhatsApp quando configurado
                pass
            except Exception as e:
                print(f"⚠️ WhatsApp não configurado: {e}")
        
        return False
