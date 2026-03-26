SHELL := /bin/bash

.PHONY: up down logs migrate-up migrate-down

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f --tail=200

migrate-up:
	docker compose exec backend sh -lc "go run ./cmd/migrate up"

migrate-down:
	docker compose exec backend sh -lc "go run ./cmd/migrate down"
