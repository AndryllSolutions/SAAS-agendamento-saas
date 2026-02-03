# Makefile para facilitar execução de comandos

.PHONY: help test-cruds test-cruds-docker up down logs

help:
	@echo "Comandos disponíveis:"
	@echo "  make up              - Iniciar todos os serviços"
	@echo "  make down            - Parar todos os serviços"
	@echo "  make test-cruds       - Executar teste de CRUDs (local)"
	@echo "  make test-cruds-docker - Executar teste de CRUDs (Docker)"
	@echo "  make logs             - Ver logs do backend"

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f backend

test-cruds:
	cd backend && python tests/test_all_cruds.py

test-cruds-docker:
	docker-compose exec backend python tests/test_all_cruds.py

setup-users:
	docker-compose exec backend python scripts/create_demo_users.py

setup-admin:
	docker-compose exec backend python scripts/create_admin.py

setup-all: setup-admin setup-users

test-cruds-full:
	docker-compose -f docker-compose.test.yml up --build

test-cruds-clean:
	docker-compose -f docker-compose.test.yml down -v
