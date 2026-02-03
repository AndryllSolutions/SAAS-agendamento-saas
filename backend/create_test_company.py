#!/usr/bin/env python3
"""
Script para criar empresa de teste em produção
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal
from app.models.company import Company
from app.models.company_user import CompanyUser
from app.models.user import User, UserRole
from app.models.company_settings import CompanySettings
from app.models.financial import CompanyFinancialSettings
from app.models.company_notification_settings import CompanyNotificationSettings
from app.models.company_theme_settings import CompanyThemeSettings
from app.models.company_admin_settings import CompanyAdminSettings
from app.core.security import get_password_hash


def create_test_company():
    """Criar empresa de teste completa"""
    db = SessionLocal()
    
    try:
        # Verificar se já existe empresa de teste
        existing_company = db.query(Company).filter(Company.slug == 'empresa-teste').first()
        
        if existing_company:
            print('❌ Empresa de teste já existe!')
            print(f'   ID: {existing_company.id}')
            print(f'   Nome: {existing_company.name}')
            print(f'   Slug: {existing_company.slug}')
            return False
        
        # Buscar usuário SAAS_OWNER para vincular
        saas_owner = db.query(User).filter(User.saas_role == 'SAAS_OWNER').first()
        
        if not saas_owner:
            print('❌ Usuário SAAS_OWNER não encontrado! Execute create_saas_owner.py primeiro.')
            return False
        
        # Criar empresa de teste
        company = Company(
            name='Empresa Teste SaaS',
            slug='empresa-teste',
            trade_name='Empresa Teste SaaS LTDA',
            document_number='12.345.678/0001-90',
            company_type='pessoa_juridica',
            email='contato@empresateste.com',
            phone='(11) 99999-8888',
            whatsapp='(11) 99999-8888',
            postal_code='01234-567',
            address='Rua Teste, 123',
            address_number='123',
            address_complement='Sala 1',
            neighborhood='Centro',
            city='São Paulo',
            state='SP',
            country='BR',
            is_active=True,
            subscription_plan='PRO',
            subscription_expires_at=datetime(2026, 12, 31, 23, 59, 59, 999999),
            features={
                'whatsapp': True,
                'push_notifications': True,
                'fiscal_integration': True,
                'multi_company': False,
                'api_access': True
            }
        )
        
        db.add(company)
        db.flush()  # Para obter o ID
        
        # Criar CompanyUser vinculado ao SAAS_OWNER
        company_user = CompanyUser(
            company_id=company.id,
            user_id=saas_owner.id,
            role='COMPANY_OWNER',
            is_active=True
        )
        
        db.add(company_user)
        
        # Criar configurações básicas da empresa
        # Company Settings
        company_settings = CompanySettings(
            company_id=company.id,
            default_message_language='pt_BR',
            currency='BRL',
            country='BR',
            timezone='America/Sao_Paulo',
            date_format='DD/MM/YYYY',
            time_format='HH:mm'
        )
        db.add(company_settings)
        
        # Financial Settings
        financial_settings = CompanyFinancialSettings(
            company_id=company.id,
            allow_retroactive_entries=False,
            allow_invoice_edit_after_conference=False,
            edit_only_value_after_conference=True,
            allow_operations_with_closed_cash=False,
            require_category_on_transaction=True,
            require_payment_form_on_transaction=True
        )
        db.add(financial_settings)
        
        # Notification Settings
        notification_settings = CompanyNotificationSettings(
            company_id=company.id,
            notify_new_appointment=True,
            notify_appointment_cancellation=True,
            notify_appointment_deletion=True,
            notify_new_review=True,
            notify_sms_response=False,
            notify_client_return=True,
            notify_goal_achievement=True,
            notify_client_waiting=True,
            notification_sound_enabled=True,
            notification_duration_seconds=5
        )
        db.add(notification_settings)
        
        # Theme Settings
        theme_settings = CompanyThemeSettings(
            company_id=company.id,
            interface_language='pt_BR',
            sidebar_color='#6366f1',
            theme_mode='light'
        )
        db.add(theme_settings)
        
        # Admin Settings
        admin_settings = CompanyAdminSettings(
            company_id=company.id,
            default_message_language='pt_BR',
            currency='BRL',
            country='BR',
            timezone='America/Sao_Paulo',
            date_format='DD/MM/YYYY',
            time_format='HH:mm'
        )
        db.add(admin_settings)
        
        db.commit()
        db.refresh(company)
        
        print('=' * 60)
        print('✅ EMPRESA DE TESTE CRIADA COM SUCESSO!')
        print('=' * 60)
        print()
        print(f'   ID: {company.id}')
        print(f'   Nome: {company.name}')
        print(f'   Slug: {company.slug}')
        print(f'   Documento: {company.document_number}')
        print(f'   Email: {company.email}')
        print(f'   Telefone: {company.phone}')
        print(f'   Plano: {company.subscription_plan}')
        print(f'   Expira em: {company.subscription_expires_at}')
        print()
        print('   Configurações criadas:')
        print('     - Company Settings ✅')
        print('     - Financial Settings ✅')
        print('     - Notification Settings ✅')
        print('     - Theme Settings ✅')
        print('     - Admin Settings ✅')
        print()
        print(f'   SAAS Owner vinculado: {saas_owner.email}')
        print(f'   Company User ID: {company_user.id}')
        print()
        print('=' * 60)
        print('🎉 Empresa pronta para uso!')
        print('=' * 60)
        
        return True
        
    except Exception as e:
        print(f'❌ Erro ao criar empresa: {e}')
        db.rollback()
        return False
    finally:
        db.close()


if __name__ == '__main__':
    from datetime import datetime
    create_test_company()
