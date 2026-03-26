SHELL := /bin/bash

.PHONY: up down logs migrate-up migrate-down pg-up pg-down pg-logs pg-shell app-up app-down app-logs migrate-pg-local dev-up dev-down dev-logs dev-reset

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f --tail=200

migrate-up:
	docker compose exec backend migrate up

migrate-down:
	docker compose exec backend migrate down

pg-up:
	docker compose -f docker-compose.postgres.yml up -d

pg-down:
	docker compose -f docker-compose.postgres.yml down

pg-logs:
	docker compose -f docker-compose.postgres.yml logs -f --tail=200

pg-shell:
	docker compose -f docker-compose.postgres.yml exec postgres psql -U $${POSTGRES_USER:-devanta} -d $${POSTGRES_DB:-devanta}

app-up:
	docker compose -f docker-compose.app.yml up -d --build

app-down:
	docker compose -f docker-compose.app.yml down

app-logs:
	docker compose -f docker-compose.app.yml logs -f --tail=200

migrate-pg-local:
	docker compose -f docker-compose.app.yml run --rm backend migrate up

dev-up:
	$(MAKE) pg-up
	$(MAKE) migrate-pg-local
	$(MAKE) app-up

dev-down:
	$(MAKE) app-down
	$(MAKE) pg-down

dev-logs:
	docker compose -f docker-compose.postgres.yml logs -f --tail=100 postgres & \
	docker compose -f docker-compose.app.yml logs -f --tail=100 backend web bot nginx

dev-reset:
	docker compose -f docker-compose.app.yml down -v --remove-orphans
	docker compose -f docker-compose.postgres.yml down -v --remove-orphans
	$(MAKE) dev-up
