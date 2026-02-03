#!/bin/bash
# Script para atualizar chaves secretas no .env.production

ENV_FILE="/opt/saas/atendo/.env.production"

# Backup
cp $ENV_FILE ${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)

# Atualizar SECRET_KEY
sed -i 's|SECRET_KEY=COPIAR_CHAVE_32_CHARS_AQUI_EXEMPLO_iOJotxMsdL4ZDVbeNRaF1GR_nUJeQQR0xYzDlWnDi80=|SECRET_KEY=m+8hSqFYaV02BcF4khodxmUEIIWSvHctKAKt6J1Anws=|g' $ENV_FILE

# Atualizar SETTINGS_ENCRYPTION_KEY
sed -i 's|SETTINGS_ENCRYPTION_KEY=COPIAR_CHAVE_32_CHARS_AQUI_EXEMPLO_iOJotxMsdL4ZDVbeNRaF1GR_nUJeQQR0xYzDlWnDi80=|SETTINGS_ENCRYPTION_KEY=3DUFabminEVt94POyEoDGJKR05C1C3SIWwffKIOJdXo=|g' $ENV_FILE

# Corrigir DATABASE_URL com senha correta
sed -i 's|DATABASE_URL=postgresql+psycopg2://agendamento_app:agendamento_app_password@db:5432/agendamento|DATABASE_URL=postgresql+psycopg2://agendamento_app:Ag3nd2026P0stgr3sS3cur3K3y@db:5432/agendamento|g' $ENV_FILE

echo "Chaves atualizadas com sucesso!"
echo "Verificando alteracoes:"
grep "SECRET_KEY=" $ENV_FILE
grep "SETTINGS_ENCRYPTION_KEY=" $ENV_FILE
grep "DATABASE_URL=" $ENV_FILE
