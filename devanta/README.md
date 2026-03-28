# Devanta — полный запуск для DevOps

Образовательная платформа (уроки, задачи, квизы, геймификация). Ниже — **пошагово от нуля**, без предположений, что ты уже что-то знаешь про проект.

**Схема БД, таблицы и как накатываются миграции/сид:** отдельный файл **[DATABASE.md](./DATABASE.md)**.

---

## 0. Что должно быть на машине

| Требование | Зачем |
|------------|--------|
| **Docker Engine** + **Docker Compose v2** (`docker compose`, не старый `docker-compose`) | Все сервисы в контейнерах |
| **GNU Make** (есть на macOS/Linux; на Windows — WSL2 или Git Bash) | Команды `make start` и т.д. |
| Свободные **порты**: `80`, `8080`, `5432`, `8090` | Иначе поднятие упадёт с `address already in use` |

Проверка Docker:

```bash
docker --version
docker compose version
```

---

## 1. Клонирование и переход в каталог

```bash
git clone <URL_РЕПОЗИТОРИЯ> devanta
cd devanta
```

Рабочий каталог дальше везде: **корень `devanta/`** (там лежат `docker-compose.yml` и `Makefile`).

---

## 2. Переменные окружения (обязательно)

Скопируй пример и отредактируй **хотя бы `JWT_SECRET`** в проде — не оставляй дефолт.

```bash
cp .env.example .env
```

### Минимум для локального/стендового запуска через nginx (`http://localhost`)

В `.env` должны быть согласованы:

- **`POSTGRES_*`** — логин/пароль/имя БД Postgres.
- **`DATABASE_URL`** — строка подключения **для бэкенда внутри Docker**: хост БД **`postgres`**, не `localhost`:

```env
DATABASE_URL=postgres://devanta:devanta@postgres:5432/devanta?sslmode=disable
```

- **`JWT_SECRET`** — длинная случайная строка (подпись JWT).
- **`CORS_ORIGIN`** — для входа с браузера через **nginx на порту 80** укажи origin приложения, например:

```env
CORS_ORIGIN=http://localhost
```

Несколько origin через запятую (пример):

```env
CORS_ORIGIN=http://localhost,http://127.0.0.1,https://твой-домен.ru
```

- **`PUBLIC_APP_URL`** (опционально) — публичный URL фронта для ссылок (родитель и т.д.). Для `http://localhost` можно оставить пустым или задать `http://localhost`.

### Support-бот (опционально)

Если бот не нужен, можно оставить заглушки в `.env` — контейнер `support-bot` всё равно стартует; без валидного `SUPPORT_TELEGRAM_BOT_TOKEN` он не будет полезен в Telegram.

Для реального бота: заполни `SUPPORT_TELEGRAM_BOT_TOKEN`, при необходимости `SUPPORT_ADMINS`, webhook-поля из `.env.example`.

---

## 3. Запуск «всё сразу» + миграции БД

Из корня `devanta/`:

```bash
make start
```

Что делает эта команда:

1. **`docker compose up -d --build`** — собирает и поднимает контейнеры.
2. **`docker compose run --rm backend migrate up`** — применяет схему БД и **сид** (курсы, уроки, задачи, FAQ и т.д.).

Ожидание: первый раз сборка может занять несколько минут.

### Альтернатива без Make

```bash
docker compose up -d --build
docker compose run --rm backend migrate up
```

---

## 4. Проверка, что живо

### Health бэкенда (через nginx)

```bash
curl -s http://localhost/health
```

Ожидаемо:

```json
{"status":"ok"}
```

### Health напрямую в API (минуя nginx)

```bash
curl -s http://localhost:8080/health
```

### Список контейнеров

```bash
docker compose ps
```

Все нужные сервисы должны быть в состоянии **Up** (Postgres — ещё и **healthy**).

---

## 5. Куда заходить браузером

| URL | Что это |
|-----|---------|
| **http://localhost/** | Фронт (React) + через тот же хост префикс **`/api`** уходит на бэкенд |
| **http://localhost:8080/** | Только API (Fiber), без фронта |
| **http://localhost/swagger/** | Swagger UI (если включён в образе бэкенда) |
| **http://localhost/openapi.yaml** | OpenAPI-спека |

Регистрация пользователя — через UI **«Зарегистрироваться»** или `POST /api/auth/register`.

---

## 6. Полезные команды Make

| Команда | Действие |
|---------|----------|
| `make start` | Поднять стенд + `migrate up` |
| `make up` | Только `docker compose up -d --build` **без** миграций |
| `make down` | Остановить контейнеры |
| `make logs` | Хвост логов всех сервисов |
| `make migrate-up` / `make migrate-down` | Только миграции |
| `make reset` | **Снести том БД**, поднять заново и снова `migrate up` (все данные пропадут) |
| `make pg-shell` | Интерактивный `psql` в Postgres |

---

## 7. Подключение к Postgres с хоста (отладка)

Параметры по умолчанию из `.env.example`:

- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `devanta`
- **User / Password:** как в `POSTGRES_USER` / `POSTGRES_PASSWORD`

Через Docker:

```bash
make pg-shell
```

---

## 8. Первый администратор веб-админки

Роль **`admin`** в JWT берётся из таблицы `users`. После обычной регистрации пользователь — **`student`**.

Назначить админа **одним запросом в БД** (подставь email зарегистрированного пользователя):

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

Пример через Docker:

```bash
docker compose exec postgres psql -U devanta -d devanta -c "UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';"
```

Вход под этим email → редирект на **`/admin`** (панель администратора). Ученический кабинет — ссылка **«Личный кабинет»** внизу слева в админке.

---

## 9. Стенд без support-бота

Если не хочешь собирать/поднимать `support-bot`, временно закомментируй сервис **`support-bot`** в `docker-compose.yml` и блок **`location /telegram/webhook`** в `docker/nginx.conf`, затем `docker compose up -d --build`.  
(В типовом сценарии бот просто стоит с пустым токеном — на веб-приложение это не влияет.)

---

## 10. Обновление кода на уже поднятом стенде

```bash
git pull
docker compose up -d --build
docker compose run --rm backend migrate up
```

Если менялись только фронт/бэкенн без миграций — достаточно `docker compose up -d --build`.

---

## 11. Типичные ошибки

### `port is already allocated`

Занят `80`, `8080`, `5432` или `8090`. Освободи порт или поменяй проброс в `docker-compose.yml`.

### CORS / не логинится с `http://localhost`

В `.env` добавь в **`CORS_ORIGIN`** именно тот origin, с которого открыт сайт (схема + хост + порт), например `http://localhost`.

### `502 Bad Gateway` на `/api`

Бэкенд не запущен или упал. Смотри:

```bash
docker compose logs backend --tail=100
```

### Миграции падают

Проверь, что **`DATABASE_URL`** в `.env` указывает на хост **`postgres`**, а не `localhost`, когда миграции гоняются **внутри** контейнера `backend`.

### Пустая БД без курсов

Убедись, что выполнялся **`migrate up`** (входит в `make start`). Полный сброс данных: `make reset`.

---

## 12. Архитектура сервисов (кратко)

```text
Браузер → nginx:80
            ├─ /api/*, /health, /uploads, /swagger → backend:8080
            ├─ /telegram/webhook → support-bot:8090
            └─ /* → web:80 (статический SPA)
backend → postgres:5432
support-bot → postgres:5432
```

---

## 13. Структура репозитория

```text
devanta/
  backend/          # Go API (Fiber, GORM)
  web/              # React + Vite + TypeScript
  support-bot/      # Telegram-бот
  docker/
    nginx.conf      # единая точка входа :80
  docker-compose.yml
  Makefile
  .env.example
```

---

## 14. API (шпаргалка)

Базовый префикс в браузере: **`/api`**.

- **Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`
- **Модули/уроки:** `GET /api/modules`, `GET /api/modules/:id/course`, …
- **Админ (роль admin):** `GET /api/admin/users`, `POST /api/admin/block`, `POST /api/admin/role`, CRUD FAQ под `/api/admin/faq`

Полная спека: **`/openapi.yaml`** на том же хосте, что и фронт.

---

Если что-то из шагов не сходится — приложи вывод `docker compose ps` и `docker compose logs backend --tail=80` к тикету.
