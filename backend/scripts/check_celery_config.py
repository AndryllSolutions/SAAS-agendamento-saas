#!/usr/bin/env python3
"""
Script para verificar configuração do Celery, RabbitMQ e Redis
"""
import redis
import pika
from celery import Celery
from app.core.config import settings
import sys

def test_redis_connection():
    """Testar conexão com Redis"""
    print("🔍 Testando conexão com Redis...")
    try:
        # Usar URL com autenticação
        redis_url = settings.get_celery_result_backend
        if redis_url.startswith('redis://'):
            # Extrair host, port, password da URL
            import re
            match = re.match(r'redis://:([^@]*)@([^:]+):(\d+)/(\d+)', redis_url)
            if match:
                password, host, port, db = match.groups()
                r = redis.Redis(host=host, port=int(port), db=int(db), password=password, decode_responses=True)
            else:
                # Fallback sem senha
                r = redis.from_url(redis_url)
        else:
            r = redis.from_url(redis_url)
            
        r.ping()
        print("✅ Redis conectado com sucesso!")
        return True
    except Exception as e:
        print(f"❌ Erro na conexão com Redis: {e}")
        return False

def test_rabbitmq_connection():
    """Testar conexão com RabbitMQ"""
    print("🔍 Testando conexão com RabbitMQ...")
    try:
        broker_url = settings.get_celery_broker_url
        credentials = pika.PlainCredentials('admin', settings.RABBITMQ_PASSWORD or 'guest')
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                host='rabbitmq',
                port=5672,
                credentials=credentials,
                virtual_host='/'
            )
        )
        connection.close()
        print("✅ RabbitMQ conectado com sucesso!")
        return True
    except Exception as e:
        print(f"❌ Erro na conexão com RabbitMQ: {e}")
        return False

def test_celery_connection():
    """Testar conexão com Celery"""
    print("🔍 Testando configuração do Celery...")
    try:
        from app.tasks.celery_app import celery_app
        
        # Verificar se o broker está acessível
        inspect = celery_app.control.inspect()
        stats = inspect.stats()
        
        if stats:
            print("✅ Celery configurado e workers ativos!")
            print(f"📊 Workers encontrados: {list(stats.keys())}")
            return True
        else:
            print("⚠️ Celery configurado mas nenhum worker ativo")
            return False
    except Exception as e:
        print(f"❌ Erro na configuração do Celery: {e}")
        return False

def main():
    """Função principal"""
    print("🚀 Verificando configuração do Celery, RabbitMQ e Redis\n")
    
    # Mostrar configuração atual
    print("📋 Configuração atual:")
    print(f"   Redis URL: {settings.get_celery_result_backend}")
    print(f"   RabbitMQ URL: {settings.get_celery_broker_url}")
    print(f"   Redis Password: {'***' if settings.REDIS_PASSWORD else 'Não definida'}")
    print(f"   RabbitMQ User: {settings.RABBITMQ_USER or 'guest'}")
    print()
    
    # Testar conexões
    results = []
    results.append(("Redis", test_redis_connection()))
    results.append(("RabbitMQ", test_rabbitmq_connection()))
    results.append(("Celery", test_celery_connection()))
    
    # Resumo
    print("\n📊 Resumo:")
    success_count = sum(1 for _, success in results if success)
    total_count = len(results)
    
    for service, success in results:
        status = "✅ OK" if success else "❌ ERRO"
        print(f"   {service}: {status}")
    
    print(f"\n🎯 Resultado: {success_count}/{total_count} serviços funcionando")
    
    if success_count == total_count:
        print("🎉 Todos os serviços estão configurados corretamente!")
        return 0
    else:
        print("⚠️ Alguns serviços precisam de atenção")
        return 1

if __name__ == "__main__":
    sys.exit(main())
