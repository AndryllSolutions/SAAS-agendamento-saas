#!/usr/bin/env python3

import subprocess
import sys

# Lista de migrações na ordem correta
migrations = [
    "1271bb114659",  # initial_schema
    "498a65194650",  # add_audit_logs_and_global_settings
    "7529dee5d9cb",  # create_plans_table
    "6a1f2b3c4d5e",  # rename_old_plans_table_to_package_plans
    "d6f40aece08f",  # update_companies_and_subscriptions_for_plans
    "create_addons_table",  # create_addons_table
    "add_price_min_max",  # add_price_min_max_to_plans
    "add_is_active_subs",  # add_is_active_to_subscriptions
    "add_icons_to_addons",  # add_icons_to_addons
    "add_scheduling_settings",  # add_company_scheduling_settings
    "add_google_calendar",  # add_google_calendar_integration
    "add_calendly_integration",  # add_calendly_integration
    "c58a084b3a2d",  # add_online_booking_configuration_tables
    "81d261141473",  # add_whatsapp_automated_campaigns_tables
    "b655dfb108b0",  # add_company_configurations_tables
    "7ca951d1bccc",  # merge heads
    "3defd0baf6a1",  # fix rls_policies_expression
    "f9657ff9a0d5",  # complete_db_schema
    "e8f3c2a1b4d7",  # create_online_booking
    "a3f4c9d2e1b0",  # add_service_extended_fields
    "b1c2d3e4f5a6",  # create_leads_table
    "f2e3d4c5b6a7",  # add_image_url_to_leads
    "4a5b6c7d8e9f",  # implement_rls_policies
    "9c2e4d6f8a10",  # add_cpf_cnpj_to_users
    "6f2a9c1e2b0a",  # add_is_configured_whatsapp_automated_campaigns
    "7bdacd27480e",  # merge_heads
    "bd1c950b16e6",  # merge heads (final)
]

def run_migration(revision):
    """Rodar uma migração específica"""
    try:
        result = subprocess.run(
            ["docker", "exec", "agendamento_backend_prod", "alembic", "upgrade", revision],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            print(f"✅ Migration {revision} aplicada com sucesso")
            return True
        else:
            print(f"❌ Erro na migration {revision}: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Exceção na migration {revision}: {e}")
        return False

def main():
    print("Iniciando aplicação de migrações na ordem correta...")
    
    for migration in migrations:
        print(f"\n🔄 Aplicando migration: {migration}")
        if not run_migration(migration):
            print(f"⚠️ Falha na migration {migration}, continuando...")
            continue
    
    print("\n✅ Processo de migrações concluído!")

if __name__ == "__main__":
    main()
