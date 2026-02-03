"""add company scheduling settings

Revision ID: add_scheduling_settings
Revises: 
Create Date: 2024-01-26 21:45:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_scheduling_settings'
down_revision = None  # Ajustar conforme última migration
branch_labels = None
depends_on = None


def upgrade():
    # Create the company_scheduling_settings table
    op.create_table('company_scheduling_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        
        # Configurações de horário
        sa.Column('business_hours', sa.JSON(), nullable=False),
        sa.Column('default_appointment_duration', sa.Integer(), nullable=False, default=60),
        sa.Column('appointment_interval', sa.Integer(), nullable=False, default=0),
        sa.Column('min_advance_booking_hours', sa.Integer(), nullable=False, default=2),
        sa.Column('max_advance_booking_days', sa.Integer(), nullable=False, default=30),
        
        # Configurações de cancelamento
        sa.Column('cancellation_deadline_hours', sa.Integer(), nullable=False, default=24),
        sa.Column('allow_client_cancellation', sa.Boolean(), nullable=False, default=True),
        
        # Configurações de lembretes
        sa.Column('reminder_hours_before', sa.JSON(), nullable=False),
        sa.Column('enabled_reminder_types', sa.JSON(), nullable=False),
        
        # Configurações de aprovação
        sa.Column('require_approval', sa.Boolean(), nullable=False, default=False),
        sa.Column('auto_confirm_minutes', sa.Integer(), nullable=True),
        
        # Configurações de lista de espera
        sa.Column('enable_waitlist', sa.Boolean(), nullable=False, default=True),
        sa.Column('max_waitlist_size', sa.Integer(), nullable=False, default=50),
        
        # Configurações de timezone
        sa.Column('timezone', sa.String(length=50), nullable=False, default='America/Sao_Paulo'),
        
        # Configurações avançadas
        sa.Column('allow_simultaneous_appointments', sa.Boolean(), nullable=False, default=False),
        sa.Column('time_buffers', sa.JSON(), nullable=True),
        sa.Column('holidays', sa.JSON(), nullable=True),
        
        # Templates de notificações
        sa.Column('notification_templates', sa.JSON(), nullable=True),
        sa.Column('available_template_variables', sa.JSON(), nullable=True),
        
        # Constraints
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('company_id')
    )
    
    # Create indexes
    op.create_index(op.f('ix_company_scheduling_settings_company_id'), 'company_scheduling_settings', ['company_id'], unique=False)
    
    # Insert default settings for existing companies
    op.execute("""
        INSERT INTO company_scheduling_settings (
            company_id, 
            created_at, 
            updated_at,
            business_hours,
            default_appointment_duration,
            appointment_interval,
            min_advance_booking_hours,
            max_advance_booking_days,
            cancellation_deadline_hours,
            allow_client_cancellation,
            reminder_hours_before,
            enabled_reminder_types,
            require_approval,
            enable_waitlist,
            max_waitlist_size,
            timezone,
            allow_simultaneous_appointments,
            time_buffers,
            holidays,
            notification_templates,
            available_template_variables
        )
        SELECT 
            id as company_id,
            NOW() as created_at,
            NOW() as updated_at,
            '{"monday": {"start": "08:00", "end": "18:00", "enabled": true}, 
              "tuesday": {"start": "08:00", "end": "18:00", "enabled": true}, 
              "wednesday": {"start": "08:00", "end": "18:00", "enabled": true}, 
              "thursday": {"start": "08:00", "end": "18:00", "enabled": true}, 
              "friday": {"start": "08:00", "end": "18:00", "enabled": true}, 
              "saturday": {"start": "08:00", "end": "14:00", "enabled": false}, 
              "sunday": {"start": "08:00", "end": "14:00", "enabled": false}}' as business_hours,
            60 as default_appointment_duration,
            0 as appointment_interval,
            2 as min_advance_booking_hours,
            30 as max_advance_booking_days,
            24 as cancellation_deadline_hours,
            true as allow_client_cancellation,
            '[24, 2]' as reminder_hours_before,
            '["email", "push"]' as enabled_reminder_types,
            false as require_approval,
            true as enable_waitlist,
            50 as max_waitlist_size,
            'America/Sao_Paulo' as timezone,
            false as allow_simultaneous_appointments,
            '{"before_appointment": 0, "after_appointment": 0, "lunch_break": {"start": "12:00", "end": "13:00", "enabled": false}}' as time_buffers,
            '[]' as holidays,
            '{
                "appointment_confirmation": {
                    "email": {
                        "subject": "Agendamento Confirmado - {service_name}",
                        "body": "Olá {client_name}! Seu agendamento foi confirmado para {appointment_date} às {appointment_time}."
                    },
                    "sms": "Agendamento confirmado: {service_name} em {appointment_date} às {appointment_time}. Até lá!",
                    "push": {
                        "title": "Agendamento Confirmado",
                        "body": "{service_name} confirmado para {appointment_date} às {appointment_time}"
                    }
                },
                "appointment_reminder_24h": {
                    "email": {
                        "subject": "Lembrete: Agendamento Amanhã - {service_name}",
                        "body": "Olá {client_name}! Lembramos que você tem agendamento amanhã ({appointment_date}) às {appointment_time}."
                    },
                    "sms": "Lembrete: Você tem agendamento amanhã às {appointment_time}. {service_name}",
                    "push": {
                        "title": "📅 Lembrete: Agendamento Amanhã",
                        "body": "{service_name} amanhã às {appointment_time}"
                    }
                },
                "appointment_reminder_2h": {
                    "email": {
                        "subject": "Lembrete: Agendamento em 2 Horas - {service_name}",
                        "body": "Olá {client_name}! Seu agendamento é daqui a 2 horas ({appointment_time})."
                    },
                    "sms": "Lembrete: Seu agendamento é daqui a 2 horas ({appointment_time})",
                    "push": {
                        "title": "⏰ Lembrete: Agendamento em 2 Horas",
                        "body": "{service_name} daqui a 2 horas ({appointment_time})"
                    }
                },
                "appointment_cancellation": {
                    "email": {
                        "subject": "Agendamento Cancelado - {service_name}",
                        "body": "Seu agendamento de {service_name} para {appointment_date} às {appointment_time} foi cancelado."
                    },
                    "sms": "Agendamento cancelado: {service_name} em {appointment_date} às {appointment_time}",
                    "push": {
                        "title": "Agendamento Cancelado",
                        "body": "{service_name} de {appointment_date} foi cancelado"
                    }
                },
                "appointment_completed": {
                    "push": {
                        "title": "✨ Atendimento Concluído",
                        "body": "Como foi sua experiência? Deixe sua avaliação!"
                    }
                }
            }' as notification_templates,
            '[
                "client_name", "client_email", "client_phone",
                "professional_name", "service_name", "service_duration",
                "appointment_date", "appointment_time", "appointment_datetime",
                "company_name", "company_phone", "company_address"
            ]' as available_template_variables
        FROM companies 
        WHERE is_active = true
    """)


def downgrade():
    # Drop indexes
    op.drop_index(op.f('ix_company_scheduling_settings_company_id'), table_name='company_scheduling_settings')
    
    # Drop table
    op.drop_table('company_scheduling_settings')
