"""
Serviço de Notificações de Agendamento com Templates Lindos
"""
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from pathlib import Path

from app.services.notification_service import NotificationService
from app.models.notification import NotificationType


class AppointmentNotificationService:
    """Serviço para enviar notificações lindas de agendamento"""
    
    @staticmethod
    def load_email_template() -> str:
        """Carrega o template HTML de email"""
        template_path = Path(__file__).parent.parent / "templates" / "email_confirmation.html"
        try:
            with open(template_path, 'r', encoding='utf-8') as f:
                return f.read()
        except:
            # Fallback para template inline
            return """
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #667eea; font-size: 32px;">✨ Agendamento Confirmado!</h1>
                        <p style="color: #666;">Estamos ansiosos para te atender</p>
                    </div>
                    
                    <p style="color: #333; font-size: 16px;">Olá <strong>{{client_name}}</strong>,</p>
                    
                    <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 15px; padding: 30px; margin: 30px 0;">
                        <table style="width: 100%;">
                            <tr><td style="color: #667eea; font-weight: bold;">📋 Serviço:</td><td style="text-align: right; font-weight: bold;">{{service_name}}</td></tr>
                            <tr><td colspan="2" style="border-top: 1px solid rgba(0,0,0,0.1); padding: 10px 0;"></td></tr>
                            <tr><td style="color: #667eea; font-weight: bold;">👤 Profissional:</td><td style="text-align: right;">{{professional_name}}</td></tr>
                            <tr><td colspan="2" style="border-top: 1px solid rgba(0,0,0,0.1); padding: 10px 0;"></td></tr>
                            <tr><td style="color: #667eea; font-weight: bold;">📅 Data:</td><td style="text-align: right;">{{date}}</td></tr>
                            <tr><td colspan="2" style="border-top: 1px solid rgba(0,0,0,0.1); padding: 10px 0;"></td></tr>
                            <tr><td style="color: #667eea; font-weight: bold;">⏰ Horário:</td><td style="text-align: right;">{{time}}</td></tr>
                            <tr><td colspan="2" style="border-top: 1px solid rgba(0,0,0,0.1); padding: 10px 0;"></td></tr>
                            <tr><td style="color: #667eea; font-weight: bold;">💰 Valor:</td><td style="text-align: right; color: #27ae60; font-size: 20px; font-weight: bold;">R$ {{price}}</td></tr>
                        </table>
                    </div>
                    
                    <div style="background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <p style="margin: 0; color: #856404; font-size: 14px;">
                            <strong>⚠️ Importante:</strong><br>
                            Por favor, chegue com 10 minutos de antecedência.<br>
                            Em caso de cancelamento, avise com pelo menos 24h de antecedência.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #666; font-size: 14px;">Dúvidas? Entre em contato conosco:</p>
                        <p style="color: #667eea; font-weight: bold;">📞 (11) 99999-9999 | 📧 contato@agendamento.com</p>
                    </div>
                </div>
            </body>
            </html>
            """
    
    @staticmethod
    def load_whatsapp_template() -> str:
        """Carrega o template de WhatsApp"""
        template_path = Path(__file__).parent.parent / "templates" / "whatsapp_confirmation.txt"
        try:
            with open(template_path, 'r', encoding='utf-8') as f:
                return f.read()
        except:
            # Fallback para template inline
            return """✨ *AGENDAMENTO CONFIRMADO!* ✨

Olá *{{client_name}}*! 👋

Seu agendamento foi confirmado com sucesso! 🎉

━━━━━━━━━━━━━━━━━━━━
📋 *DETALHES DO AGENDAMENTO*
━━━━━━━━━━━━━━━━━━━━

💼 *Serviço:* {{service_name}}
👤 *Profissional:* {{professional_name}}
📅 *Data:* {{date}}
⏰ *Horário:* {{time}}
💰 *Valor:* R$ {{price}}

━━━━━━━━━━━━━━━━━━━━

⚠️ *IMPORTANTE:*
• Chegue com 10 minutos de antecedência
• Cancelamentos com menos de 24h podem ter taxa
• Traga um documento com foto

━━━━━━━━━━━━━━━━━━━━

Estamos ansiosos para te atender! 💜

Dúvidas? Responda esta mensagem ou ligue:
📞 (11) 99999-9999

_Agendamento SaaS - Seu tempo é precioso_ ⏰✨"""
    
    @staticmethod
    def send_booking_confirmation(
        db: Session,
        client_name: str,
        client_email: str,
        client_phone: Optional[str],
        service_name: str,
        service_price: float,
        professional_name: str,
        appointment_datetime: datetime,
        user_id: Optional[int] = None
    ):
        """Envia confirmação de agendamento linda via email e WhatsApp"""
        
        # Formatar data e hora
        date_str = appointment_datetime.strftime("%d/%m/%Y")
        time_str = appointment_datetime.strftime("%H:%M")
        
        # Preparar dados para os templates
        template_data = {
            "client_name": client_name,
            "service_name": service_name,
            "professional_name": professional_name,
            "date": date_str,
            "time": time_str,
            "price": f"{service_price:.2f}",
            "calendar_link": "#",  # Pode implementar link do Google Calendar
            "company_address": "Rua Exemplo, 123 - São Paulo/SP",
            "company_phone": "(11) 99999-9999",
            "maps_link": "https://maps.google.com"
        }
        
        # EMAIL HTML
        try:
            email_template = AppointmentNotificationService.load_email_template()
            email_html = email_template
            for key, value in template_data.items():
                email_html = email_html.replace(f"{{{{{key}}}}}", str(value))
            
            subject = f"✨ Agendamento Confirmado - {service_name}"
            
            NotificationService.send_email(
                to_email=client_email,
                subject=subject,
                body=f"Seu agendamento foi confirmado para {date_str} às {time_str}",
                html_body=email_html
            )
            
            print(f"✅ Email enviado para {client_email}")
            
            # Criar notificação no banco
            if user_id:
                NotificationService.create_notification(
                    db=db,
                    user_id=user_id,
                    notification_type=NotificationType.EMAIL,
                    title="Agendamento Confirmado",
                    message=f"Seu agendamento de {service_name} foi confirmado para {date_str} às {time_str}",
                    recipient=client_email
                )
        except Exception as e:
            print(f"❌ Erro ao enviar email: {e}")
        
        # WHATSAPP
        if client_phone:
            try:
                whatsapp_template = AppointmentNotificationService.load_whatsapp_template()
                whatsapp_message = whatsapp_template
                for key, value in template_data.items():
                    whatsapp_message = whatsapp_message.replace(f"{{{{{key}}}}}", str(value))
                
                NotificationService.send_whatsapp(
                    to_phone=client_phone,
                    message=whatsapp_message
                )
                
                print(f"✅ WhatsApp enviado para {client_phone}")
                
                # Criar notificação no banco
                if user_id:
                    NotificationService.create_notification(
                        db=db,
                        user_id=user_id,
                        notification_type=NotificationType.WHATSAPP,
                        title="Agendamento Confirmado",
                        message=f"Confirmação enviada via WhatsApp",
                        recipient=client_phone
                    )
            except Exception as e:
                print(f"❌ Erro ao enviar WhatsApp: {e}")
        
        return True
