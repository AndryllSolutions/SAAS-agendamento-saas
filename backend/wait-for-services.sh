#!/bin/sh
# wait-for-services.sh - Wait for all required services to be ready

set -e

echo "Waiting for PostgreSQL..."
until pg_isready -h db -U ${POSTGRES_USER:-agendamento_user} > /dev/null 2>&1; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "PostgreSQL is up!"

echo "Waiting for Redis..."
until redis-cli -h redis -a ${REDIS_PASSWORD:-redis_secure_password_change_me} ping > /dev/null 2>&1; do
  echo "Redis is unavailable - sleeping"
  sleep 2
done
echo "Redis is up!"

echo "Waiting for RabbitMQ..."
until wget -q --spider "http://rabbitmq:15672/api/healthchecks/node" 2>/dev/null; do
  echo "RabbitMQ is unavailable - sleeping"
  sleep 2
done
echo "RabbitMQ is up!"

echo "All services are ready!"
exec "$@"


