.PHONY: help install build up down logs test clean docs

help:
	@echo "Lead Generation Dashboard - Makefile Commands"
	@echo "=============================================="
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make install          Install all dependencies (backend + frontend)"
	@echo "  make setup-env        Copy .env.example to .env"
	@echo ""
	@echo "Docker Commands:"
	@echo "  make build            Build Docker images"
	@echo "  make up               Start all services (docker-compose)"
	@echo "  make down             Stop all services"
	@echo "  make logs             Show logs from all services (follow)"
	@echo "  make logs-backend     Show backend logs only"
	@echo "  make logs-frontend    Show frontend logs only"
	@echo "  make logs-db          Show database logs only"
	@echo ""
	@echo "Development:"
	@echo "  make dev-backend      Run backend locally (uvicorn)"
	@echo "  make dev-frontend     Run frontend locally (npm dev)"
	@echo "  make dev-db           Start PostgreSQL (Docker)"
	@echo ""
	@echo "Testing & Quality:"
	@echo "  make test             Run backend test suite"
	@echo "  make test-api         Test API endpoints with curl"
	@echo "  make lint             Run Python linter (pylint)"
	@echo "  make format           Format Python code (black)"
	@echo ""
	@echo "Database:"
	@echo "  make db-init          Initialize database tables"
	@echo "  make db-migrate       Run Alembic migrations"
	@echo "  make db-shell         Open PostgreSQL shell"
	@echo "  make db-reset         Drop all tables (USE WITH CAUTION)"
	@echo ""
	@echo "Utilities:"
	@echo "  make import-csv       Import sample CSV file"
	@echo "  make clean            Clean up build artifacts and cache"
	@echo "  make docs             Generate API documentation"
	@echo "  make health           Check health of all services"
	@echo ""

# Setup
install: setup-env
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✓ Installation complete"

setup-env:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✓ .env created from .env.example"; \
	else \
		echo "⚠ .env already exists"; \
	fi

# Docker
build:
	docker-compose build

up:
	@echo "Starting services..."
	docker-compose up -d
	@echo "Waiting for services to start..."
	@sleep 10
	@echo "✓ Services started"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:8000"
	@echo "Docs:     http://localhost:8000/docs"

down:
	docker-compose down
	@echo "✓ Services stopped"

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f postgres

# Development
dev-backend:
	@echo "Starting backend (http://localhost:8000)..."
	cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	@echo "Starting frontend (http://localhost:3000)..."
	cd frontend && npm run dev

dev-db:
	docker run --name lead_gen_postgres -e POSTGRES_PASSWORD=postgres -d -p 5432:5432 postgres:15-alpine
	@echo "✓ PostgreSQL started on port 5432"

# Testing
test:
	@echo "Running backend test suite..."
	cd backend && python test_api.py

test-api:
	@echo "Testing API endpoints..."
	@echo "1. Health check:"
	@curl -s http://localhost:8000/api/health | jq .
	@echo "\n2. Get leads (empty):"
	@curl -s http://localhost:8000/api/leads | jq '.total'
	@echo "\n3. Get dashboard metrics:"
	@curl -s http://localhost:8000/api/dashboard/metrics | jq .

lint:
	@echo "Running pylint..."
	cd backend && pylint *.py --disable=all --enable=E,F

format:
	@echo "Formatting Python code..."
	cd backend && black *.py

# Database
db-init:
	@echo "Initializing database..."
	cd backend && python -c "from database import init_db; init_db()"
	@echo "✓ Database initialized"

db-migrate:
	cd backend && alembic upgrade head

db-shell:
	@echo "Opening PostgreSQL shell..."
	psql -U postgres -d lead_generation_db

db-reset:
	@echo "⚠ WARNING: This will drop all tables!"
	@read -p "Are you sure? (y/N) " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		cd backend && python -c "from database import drop_db; drop_db()"; \
		echo "✓ Database reset"; \
	fi

# Utilities
import-csv:
	@echo "Importing sample CSV..."
	curl -X POST http://localhost:8000/api/import/csv \
		-F "file=@sample_leads.csv" | jq .

clean:
	@echo "Cleaning up..."
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	cd frontend && rm -rf .next build node_modules/.cache 2>/dev/null || true
	rm -f test_leads.db 2>/dev/null || true
	@echo "✓ Cleaned up"

docs:
	@echo "API docs available at: http://localhost:8000/docs"
	@echo "Opening in browser..."
	@which xdg-open > /dev/null && xdg-open http://localhost:8000/docs || \
	which open > /dev/null && open http://localhost:8000/docs || \
	echo "Please open http://localhost:8000/docs in your browser"

health:
	@echo "Checking service health..."
	@echo -n "Backend:  "
	@curl -s http://localhost:8000/api/health > /dev/null && echo "✓ OK" || echo "✗ FAILED"
	@echo -n "Frontend: "
	@curl -s http://localhost:3000 > /dev/null && echo "✓ OK" || echo "✗ FAILED"
	@echo -n "Database: "
	@docker exec lead_gen_postgres pg_isready -U postgres > /dev/null 2>&1 && echo "✓ OK" || echo "✗ FAILED"

# Default
.DEFAULT_GOAL := help
