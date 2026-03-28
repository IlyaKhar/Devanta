SHELL := /bin/bash

.PHONY: start up down logs migrate-up migrate-down reset pg-shell demo-complete course-smoke

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f --tail=200

migrate-up:
	docker compose run --rm backend migrate up

migrate-down:
	docker compose run --rm backend migrate down

start:
	$(MAKE) up
	$(MAKE) migrate-up

reset:
	docker compose down -v --remove-orphans
	$(MAKE) start

pg-shell:
	docker compose exec postgres psql -U $${POSTGRES_USER:-devanta} -d $${POSTGRES_DB:-devanta}

# Пример: make demo-complete DEMO_EMAIL=user@test.ru DEMO_MODULE=1
demo-complete:
	@test -n "$$DEMO_EMAIL" && test -n "$$DEMO_MODULE" || (echo "Задай DEMO_EMAIL и DEMO_MODULE (id модуля)"; exit 1)
	docker compose run --rm backend demo-complete -email=$$DEMO_EMAIL -module=$$DEMO_MODULE

# Авто-прохождение модуля в БД + проверка API (backend должен быть доступен).
# Локально: cd backend && go run ./cmd/course-smoke -email=... -password=... -module=1
# Docker (API внутри сети): SMOKE_API_BASE=http://backend:8080/api docker compose run --rm backend course-smoke -email=... -password=... -module=1
course-smoke:
	@test -n "$$SMOKE_EMAIL" && test -n "$$SMOKE_PASSWORD" && test -n "$$SMOKE_MODULE" || (echo "Задай SMOKE_EMAIL, SMOKE_PASSWORD, SMOKE_MODULE; опционально SMOKE_API_BASE (дефолт http://backend:8080/api, нужен поднятый compose)"; exit 1)
	docker compose run --rm -e SMOKE_API_BASE=$${SMOKE_API_BASE:-http://backend:8080/api} backend course-smoke -email=$$SMOKE_EMAIL -password=$$SMOKE_PASSWORD -module=$$SMOKE_MODULE
