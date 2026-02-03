#!/bin/sh
# wait-for-rabbitmq.sh - Wait for RabbitMQ to be ready

set -e

host="$1"
shift
cmd="$@"

until wget -q --spider "http://${host}:15672/api/healthchecks/node" 2>/dev/null; do
  >&2 echo "RabbitMQ is unavailable - sleeping"
  sleep 2
done

>&2 echo "RabbitMQ is up - executing command"
exec $cmd


