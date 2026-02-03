#!/bin/bash
# Script para resetar senha do PostgreSQL

echo "Resetando senha do usuario agendamento_app no PostgreSQL..."

# Executar dentro do container do PostgreSQL
docker compose -f docker-compose.prod.yml exec -T db sh << 'EOFSH'
export PGPASSWORD="${POSTGRES_PASSWORD}"
psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" << 'EOFSQL'
ALTER USER agendamento_app WITH PASSWORD 'Ag3nd2026P0stgr3sS3cur3K3y';
SELECT 'Senha alterada com sucesso!' as status;
EOFSQL
EOFSH

echo "Senha resetada! Testando conexao..."

# Testar conexão com a nova senha
docker compose -f docker-compose.prod.yml exec -T db sh << 'EOFSH'
export PGPASSWORD='Ag3nd2026P0stgr3sS3cur3K3y'
psql -U agendamento_app -d agendamento -c "SELECT 'Conexao OK!' as status;"
EOFSH

echo "Pronto! Agora reinicie o backend."
