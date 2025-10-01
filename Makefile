.PHONY: help install dev build up down logs clean test init-db

help:
	@echo "Agendamento SaaS - Available commands:"
	@echo "  make install    - Install dependencies"
	@echo "  make dev        - Start development environment"
	@echo "  make build      - Build Docker images"
	@echo "  make up         - Start all services"
	@echo "  make down       - Stop all services"
	@echo "  make logs       - View logs"
	@echo "  make clean      - Clean up containers and volumes"
	@echo "  make test       - Run tests"
	@echo "  make init-db    - Initialize database with sample data"

install:
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

dev:
	@echo "Starting development environment..."
	docker-compose up -d db redis rabbitmq
	@echo "Waiting for services to be ready..."
	sleep 5
	@echo "Services ready! You can now run:"
	@echo "  Backend: cd backend && uvicorn app.main:app --reload"
	@echo "  Frontend: cd frontend && npm run dev"

build:
	@echo "Building Docker images..."
	docker-compose build

up:
	@echo "Starting all services..."
	docker-compose up -d
	@echo "Services started!"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend API: http://localhost:8000"
	@echo "  API Docs: http://localhost:8000/docs"

down:
	@echo "Stopping all services..."
	docker-compose down

logs:
	docker-compose logs -f

clean:
	@echo "Cleaning up..."
	docker-compose down -v
	docker system prune -f

test:
	@echo "Running tests..."
	cd backend && pytest

init-db:
	@echo "Initializing database..."
	docker-compose exec backend python scripts/init_db.py

migrate:
	@echo "Running database migrations..."
	docker-compose exec backend alembic upgrade head

backup-db:
	@echo "Creating database backup..."
	docker-compose exec db pg_dump -U agendamento agendamento_db > backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Backup created!"

restore-db:
	@echo "Restoring database from backup..."
	@read -p "Enter backup file name: " backup_file; \
	docker-compose exec -T db psql -U agendamento agendamento_db < $$backup_file
