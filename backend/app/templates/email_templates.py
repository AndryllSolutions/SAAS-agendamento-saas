"""
Email Templates for Appointment Notifications
"""
from datetime import datetime
from typing import Optional


def get_appointment_confirmation_template(
    client_name: str,
    service_name: str,
    professional_name: str,
    start_time: datetime,
    company_name: str,
    company_address: Optional[str] = None,
    company_phone: Optional[str] = None,
    check_in_code: Optional[str] = None,
    cancellation_link: Optional[str] = None
) -> tuple[str, str]:
    """
    Generate appointment confirmation email template
    Returns: (html_body, plain_text_body)
    """
    
    # Format date and time
    date_formatted = start_time.strftime("%d/%m/%Y")
    time_formatted = start_time.strftime("%H:%M")
    weekday_map = {
        'Monday': 'Segunda-feira',
        'Tuesday': 'Terça-feira',
        'Wednesday': 'Quarta-feira',
        'Thursday': 'Quinta-feira',
        'Friday': 'Sexta-feira',
        'Saturday': 'Sábado',
        'Sunday': 'Domingo'
    }
    weekday = weekday_map.get(start_time.strftime('%A'), start_time.strftime('%A'))
    
    # Plain text version
    plain_text = f"""
Olá {client_name}!

✅ SEU AGENDAMENTO FOI CONFIRMADO!

Detalhes do Agendamento:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Data: {weekday}, {date_formatted}
🕐 Horário: {time_formatted}
✂️ Serviço: {service_name}
👤 Profissional: {professional_name}
🏢 Local: {company_name}
"""

    if company_address:
        plain_text += f"📍 Endereço: {company_address}\n"
    
    if company_phone:
        plain_text += f"📞 Telefone: {company_phone}\n"
    
    if check_in_code:
        plain_text += f"\n🔑 Código de Check-in: {check_in_code}\n"
    
    plain_text += """
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ LEMBRE-SE:
• Chegue com 10 minutos de antecedência
• Traga seus documentos, se necessário
• Em caso de imprevisto, avise-nos com antecedência

"""
    
    if cancellation_link:
        plain_text += f"\n❌ Precisa cancelar? Clique aqui: {cancellation_link}\n"
    
    plain_text += f"""
Aguardamos você!
Equipe {company_name}

---
Este é um email automático. Não responda diretamente.
"""

    # HTML version (modern and professional)
    html_body = f"""
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmação de Agendamento</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f7fa;">
        <tr>
            <td style="padding: 40px 20px;">
                <!-- Main Container -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px 16px 0 0;">
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center;">
                            <div style="background-color: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                                <span style="font-size: 48px;">✅</span>
                            </div>
                            <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                Agendamento Confirmado!
                            </h1>
                            <p style="margin: 10px 0 0; color: rgba(255,255,255,0.95); font-size: 16px;">
                                Olá {client_name}, tudo pronto para seu atendimento!
                            </p>
                        </td>
                    </tr>
                </table>
                
                <!-- Content Container -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    <!-- Appointment Details -->
                    <tr>
                        <td style="padding: 40px;">
                            <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px;">
                                <h2 style="margin: 0 0 24px 0; color: #2d3748; font-size: 20px; font-weight: 600; text-align: center;">
                                    📋 Detalhes do Agendamento
                                </h2>
                                
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                        <td style="padding: 12px 0;">
                                            <div style="display: flex; align-items: center;">
                                                <span style="font-size: 24px; margin-right: 12px;">📅</span>
                                                <div>
                                                    <div style="font-size: 13px; color: #718096; margin-bottom: 2px;">Data</div>
                                                    <div style="font-size: 16px; color: #2d3748; font-weight: 600;">{weekday}, {date_formatted}</div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0; border-top: 1px solid rgba(0,0,0,0.06);">
                                            <div style="display: flex; align-items: center;">
                                                <span style="font-size: 24px; margin-right: 12px;">🕐</span>
                                                <div>
                                                    <div style="font-size: 13px; color: #718096; margin-bottom: 2px;">Horário</div>
                                                    <div style="font-size: 16px; color: #2d3748; font-weight: 600;">{time_formatted}</div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0; border-top: 1px solid rgba(0,0,0,0.06);">
                                            <div style="display: flex; align-items: center;">
                                                <span style="font-size: 24px; margin-right: 12px;">✂️</span>
                                                <div>
                                                    <div style="font-size: 13px; color: #718096; margin-bottom: 2px;">Serviço</div>
                                                    <div style="font-size: 16px; color: #2d3748; font-weight: 600;">{service_name}</div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0; border-top: 1px solid rgba(0,0,0,0.06);">
                                            <div style="display: flex; align-items: center;">
                                                <span style="font-size: 24px; margin-right: 12px;">👤</span>
                                                <div>
                                                    <div style="font-size: 13px; color: #718096; margin-bottom: 2px;">Profissional</div>
                                                    <div style="font-size: 16px; color: #2d3748; font-weight: 600;">{professional_name}</div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0; border-top: 1px solid rgba(0,0,0,0.06);">
                                            <div style="display: flex; align-items: center;">
                                                <span style="font-size: 24px; margin-right: 12px;">🏢</span>
                                                <div>
                                                    <div style="font-size: 13px; color: #718096; margin-bottom: 2px;">Local</div>
                                                    <div style="font-size: 16px; color: #2d3748; font-weight: 600;">{company_name}</div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
"""

    if company_address:
        html_body += f"""
                                    <tr>
                                        <td style="padding: 12px 0; border-top: 1px solid rgba(0,0,0,0.06);">
                                            <div style="display: flex; align-items: center;">
                                                <span style="font-size: 24px; margin-right: 12px;">📍</span>
                                                <div>
                                                    <div style="font-size: 13px; color: #718096; margin-bottom: 2px;">Endereço</div>
                                                    <div style="font-size: 14px; color: #2d3748; line-height: 1.5;">{company_address}</div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
"""

    if company_phone:
        html_body += f"""
                                    <tr>
                                        <td style="padding: 12px 0; border-top: 1px solid rgba(0,0,0,0.06);">
                                            <div style="display: flex; align-items: center;">
                                                <span style="font-size: 24px; margin-right: 12px;">📞</span>
                                                <div>
                                                    <div style="font-size: 13px; color: #718096; margin-bottom: 2px;">Telefone</div>
                                                    <div style="font-size: 16px; color: #2d3748; font-weight: 600;">{company_phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
"""

    html_body += """
                                </table>
                            </div>
"""

    if check_in_code:
        html_body += f"""
                            <!-- Check-in Code -->
                            <div style="background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 30px;">
                                <div style="font-size: 14px; color: #2d3748; margin-bottom: 8px; font-weight: 600;">🔑 Código de Check-in</div>
                                <div style="font-size: 28px; color: #2d3748; font-weight: 700; letter-spacing: 3px; font-family: monospace; background: white; padding: 16px; border-radius: 8px; display: inline-block;">
                                    {check_in_code}
                                </div>
                                <div style="font-size: 12px; color: #4a5568; margin-top: 8px;">Use este código ao chegar</div>
                            </div>
"""

    html_body += """
                            <!-- Reminders -->
                            <div style="background-color: #e6fffa; border-left: 4px solid #38b2ac; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                                <h3 style="margin: 0 0 16px 0; color: #2c7a7b; font-size: 16px; font-weight: 600;">
                                    ⏰ Lembretes Importantes
                                </h3>
                                <ul style="margin: 0; padding-left: 20px; color: #2d3748; font-size: 14px; line-height: 1.8;">
                                    <li>Chegue com <strong>10 minutos de antecedência</strong></li>
                                    <li>Traga seus <strong>documentos</strong>, se necessário</li>
                                    <li>Em caso de imprevisto, <strong>avise-nos com antecedência</strong></li>
                                </ul>
                            </div>
"""

    if cancellation_link:
        html_body += f"""
                            <!-- Cancel Button -->
                            <div style="text-align: center; margin-bottom: 30px;">
                                <a href="{cancellation_link}" style="display: inline-block; padding: 12px 32px; background-color: #fc8181; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(252, 129, 129, 0.3);">
                                    ❌ Cancelar Agendamento
                                </a>
                            </div>
"""

    html_body += f"""
                            <!-- Footer -->
                            <div style="text-align: center; padding-top: 30px; border-top: 1px solid #e2e8f0;">
                                <p style="margin: 0 0 12px 0; color: #4a5568; font-size: 16px; font-weight: 600;">
                                    Aguardamos você! 💜
                                </p>
                                <p style="margin: 0; color: #718096; font-size: 14px;">
                                    Equipe {company_name}
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Disclaimer -->
                    <tr>
                        <td style="padding: 20px 40px; background-color: #f7fafc; border-radius: 0 0 16px 16px;">
                            <p style="margin: 0; color: #a0aec0; font-size: 12px; text-align: center; line-height: 1.6;">
                                Este é um email automático de confirmação de agendamento.<br>
                                Por favor, não responda diretamente a esta mensagem.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""
    
    return html_body, plain_text

