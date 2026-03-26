# Devanta

Devanta — образовательная платформа для детей 7–15 лет: уроки, задачи, квизы, геймификация и ИИ-ассистент Max.

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

2. Поднять сервисы:

```bash
docker compose up -d --build
```

3. Применить миграции:

```bash
docker compose exec backend migrate up
```

4. Проверить health:

```bash
curl http://localhost/health
```

Ожидаемый ответ:

```json
{"status":"ok"}
```

## Сервисы

- `postgres` — база данных
- `backend` — API (Go + Fiber + GORM)
- `web` — React frontend
- `bot` — Telegram бот Max
- `nginx` — reverse proxy

## Make команды

- `make up` — запустить окружение
- `make down` — остановить окружение
- `make logs` — логи
- `make migrate-up` — миграции вверх
- `make migrate-down` — миграции вниз

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

### AI Max
- `POST /api/ai/explain`
- `POST /api/ai/hint`
- `POST /api/ai/check`
- `GET /api/ai/limits`

## Примечание

Текущий каркас готов для расширения: добавляйте реальные use-case сервисы, валидацию, полноценный RBAC, rate limiting и интеграцию с Yandex AI API через backend.
