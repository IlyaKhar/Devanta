SHELL := /bin/bash

.PHONY: start up down logs migrate-up migrate-down reset pg-shell

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
