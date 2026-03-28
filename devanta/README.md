# Devanta

Devanta — образовательная платформа для детей 7–15 лет: уроки, задачи, квизы и геймификация.

## Monorepo

```text
/devanta
  /backend
  /web
  /mobile
  /bot
  /docker
  docker-compose.yml
  .env.example
  Makefile
  README.md
```

## Быстрый старт

1. Скопировать env:

```bash
cp .env.example .env
```

2. Поднять весь стенд одной командой:

```bash
make start
```

3. Проверить health:

```bash
curl http://localhost/health
```

Ожидаемый ответ health:

```json
{"status":"ok"}
```

## Сервисы

- `postgres` — база данных
- `backend` — API (Go + Fiber + GORM)
- `web` — React frontend
- `bot` — Telegram support-бот
- `nginx` — reverse proxy

## Make команды

- `make start` — запустить весь проект и применить миграции
- `make up` — запустить окружение без миграций
- `make down` — остановить окружение
- `make logs` — логи
- `make migrate-up` — миграции вверх
- `make migrate-down` — миграции вниз
- `make reset` — полный сброс с удалением данных БД и чистым стартом
- `make pg-shell` — открыть psql в Postgres контейнере

## Подключение к локальной БД

- host: `localhost`
- port: `5432`
- db: `devanta`
- user: `devanta`
- password: `devanta`

## API (основные)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`

### Learning
- `GET /api/modules`
- `GET /api/modules/:id/lessons`
- `GET /api/lessons/:id`
- `POST /api/tasks/:id/submit`

### Quiz
- `GET /api/quiz/:moduleId`
- `POST /api/quiz/submit`

### Progress
- `GET /api/progress`
- `GET /api/leaderboard`

### Reviews & Moderation
- `GET /api/reviews`
- `POST /api/reviews`
- `GET /api/moderation/reviews`
- `POST /api/moderation/reviews/:id/publish`
- `POST /api/moderation/reviews/:id/reject`

### Admin
- `GET /api/admin/users`
- `POST /api/admin/block`
- `POST /api/admin/role`

## Примечание

Текущий каркас готов для расширения: добавляйте реальные use-case сервисы, валидацию, полноценный RBAC и rate limiting.
