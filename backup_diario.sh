#!/bin/bash

# Backup Diário Automático - Atendo SaaS
# Executa todo dia às 00:59

DATA=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/saas/atendo/backups"
ZIP_PASSWORD="SAKDJSAPODJ)(@!UEJ!@(P(E)$!@MR_!@JK"

echo "🔒 Iniciando backup automático - $DATA"

# Criar diretório de backups se não existir
mkdir -p $BACKUP_DIR

# Backup do PostgreSQL
echo "📊 Fazendo backup do PostgreSQL..."
docker exec agendamento_db_prod pg_dump -U agendamento_app agendamento > $BACKUP_DIR/postgres_$DATA.sql

# Backup do Redis
echo "🔴 Fazendo backup do Redis..."
docker exec agendamento_redis_prod redis-cli --no-auth-warning -a R3d1s2026S3cur3K3yAg3nd BGSAVE
sleep 5
docker cp agendamento_redis_prod:/data/dump.rdb $BACKUP_DIR/redis_$DATA.rdb

# Zipar com senha
echo "🗜️ Compactando backups com senha..."
cd $BACKUP_DIR

# Zip PostgreSQL
zip -q --password "$ZIP_PASSWORD" postgres_$DATA.zip postgres_$DATA.sql
rm postgres_$DATA.sql

# Zip Redis
zip -q --password "$ZIP_PASSWORD" redis_$DATA.zip redis_$DATA.rdb
rm redis_$DATA.rdb

# Limpar backups antigos (manter últimos 7 dias)
echo "🧹 Limpando backups antigos..."
find $BACKUP_DIR -name "*.zip" -mtime +7 -delete

echo "✅ Backup automático concluído - $DATA"
echo "📁 Arquivos salvos em: $BACKUP_DIR"
echo "📊 Tamanho: $(du -sh $BACKUP_DIR/*.zip | awk '{sum+=$1} END {print sum}')"
