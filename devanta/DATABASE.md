# База данных Devanta — схема и запуск для DevOps

Документ описывает **реальную схему приложения** (как её создаёт бэкенд), а не только старый SQL-файл в репозитории.

---

## 1. Откуда берётся схема (важно)

| Что | Где в коде | Зачем |
|-----|------------|--------|
| **Модели (таблицы и поля)** | `backend/internal/models/models.go` | Единый источник структуры сущностей |
| **Создание/обновление таблиц + сид данных** | `backend/internal/database/db.go` → `RunUpMigrations()` | `AutoMigrate` всех моделей + `seedCatalog()` (курсы, уроки, задачи, квизы, FAQ, ачивки, спецчелленджи) |
| **Команда миграций в Docker** | `backend/cmd/migrate/main.go` | Вызывается как `migrate up` / `migrate down` |
| **Файл** `backend/migrations/0001_init.sql` | Goose-наследие | **Не используется** при стандартном `make migrate-up`; актуальная схема накатывается **GORM** из `RunUpMigrations` |

**Итог для DevOps:** чтобы поднять БД «как у разработчиков», достаточно из корня `devanta/` выполнить:

```bash
make migrate-up
# или
docker compose run --rm backend migrate up
```

Нужны запущенный Postgres и корректный **`DATABASE_URL`** в `.env` (хост **`postgres`** внутри Docker-сети).

При старте **только** `server` без `migrate up` часть колонок подтягивается через `EnsureUserSchema` и др., но **полный каталог курсов и сид** — только после **`migrate up`**.

---

## 2. СУБД и подключение

- **СУБД:** PostgreSQL (в `docker-compose` образ `postgres:16-alpine`).
- **Строка подключения приложения:** переменная **`DATABASE_URL`** (см. `.env.example`).
- **Локально с хоста** (psql, GUI): `localhost:5432`, БД/юзер из `POSTGRES_*` в `.env`.

---

## 3. Таблицы (имена как у GORM в PostgreSQL)

Ниже — логические имена и назначение. Точные типы колонок соответствуют полям в `models.go` (GORM маппит в `snake_case`).

### Пользователи и доступ

| Таблица | Назначение |
|---------|------------|
| **users** | Пользователи: email, хеш пароля, `role` (`student` / `parent` / `moderator` / `admin`), профиль, `blocked`, `coins`, уведомления, опционально `telegram_id` |

### Обучение (контент)

| Таблица | Назначение |
|---------|------------|
| **modules** | Курсы/модули (название, сортировка, длительность, студенты, рейтинг, уровень) |
| **lessons** | Уроки: привязка к `module_id`, контент, `video_url`, `sort_order` |
| **tasks** | Задачи к уроку: текст, тип, `xp_reward`, для кода — `starter_code`, `hints_json`, `checks_json`, `language` |
| **quiz_questions** | Вопросы квиза по модулю: `block_index`, `lesson_in_block`, варианты, `correct_idx` |
| **special_challenges** | Спецчелленджи на странице «Задачи» (`code`, награда XP и т.д.) |
| **faq_entries** | Записи FAQ для публичной страницы |

### Прогресс и геймификация

| Таблица | Назначение |
|---------|------------|
| **user_progresses** | Прогресс по урокам: `user_id`, `lesson_id`, `status` (`in_progress` / `completed`), `score` |
| **block_quiz_results** | Результат теста по слоту: `user_id`, `module_id`, `block_index`, `lesson_in_block`, процент, `passed`, попытки |
| **xp_events** | События начисления XP (`source`: например `task_complete`, `quiz_passed`, `challenge_complete`) |
| **achievements** | Справочник достижений по `code` |
| **user_achievements** | Выданные пользователю достижения |
| **user_challenge_claims** | Одноразовая выдача награды за спецчеллендж: пара `user_id` + `code` (уникальный индекс) |

### Отзывы, логи, родители

| Таблица | Назначение |
|---------|------------|
| **reviews** | Отзывы пользователей, статус модерации |
| **moderation_logs** | Лог действий модератора по отзыву |
| **ai_logs** | Логи обращений к AI (режим, хеш промпта, задержка) |
| **parent_connections** | Связь ученик ↔ родитель (оба в `users`) |

### Чего нет в текущем AutoMigrate

В старом `0001_init.sql` встречались **`parent_child_links`**, **`leaderboard_cache`** — в актуальном `RunUpMigrations` они **не создаются**. Лидерборд в приложении считается иначе (см. API).

---

## 4. Связи (логика)

- **lessons** → **modules** (`module_id`)
- **tasks** → **lessons** (`lesson_id`)
- **quiz_questions** → **modules** (`module_id`)
- **user_progresses** → **users**, **lessons**
- **block_quiz_results** → пользователь + модуль + слот блока/урока (уникальная комбинация слота)
- **xp_events**, **user_achievements**, **reviews**, **ai_logs** → **users**
- **user_achievements** → **achievements**
- **moderation_logs** → **reviews**, **users** (actor)
- **parent_connections** → два **users** (student / parent)
- **user_challenge_claims** → **users** + строковый `code` челленджа

---

## 5. Файлы репозитория, связанные с БД

| Путь | Роль |
|------|------|
| `backend/internal/models/models.go` | Все сущности |
| `backend/internal/database/db.go` | Подключение, `RunUpMigrations`, `RunDownMigrations`, сид каталога |
| `backend/internal/database/seed_democontent.go`, `seed_lesson_theory.go` | Контент уроков/квизов/задач |
| `backend/cmd/migrate/main.go` | CLI: `migrate up` / `down` |
| `backend/cmd/server/main.go` | Точечные `Ensure*Schema` при старте API (не заменяют полный `migrate up`) |
| `backend/migrations/0001_init.sql` | Исторический goose-скрипт; **не источник правды** для текущего Docker-флоу |

---

## 6. Откат / полный сброс (осторожно)

Из корня `devanta/`:

```bash
make migrate-down   # дропает таблицы из списка в RunDownMigrations
make reset          # docker down -v + снова start с чистым томом Postgres
```

**`reset` удаляет данные Postgres** в томе `postgres_data`.

---

## 7. Бэкап и восстановление (кратко)

Дамп:

```bash
docker compose exec postgres pg_dump -U devanta devanta > backup.sql
```

Восстановление (на пустую БД):

```bash
docker compose exec -T postgres psql -U devanta -d devanta < backup.sql
```

(Подставь свои `POSTGRES_USER` / `POSTGRES_DB` из `.env`.)

---

## 8. Назначение первого администратора

Роль веб-админки хранится в **`users.role`**. После регистрации обычно `student`. Пример:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

---

Более общий запуск стенда см. **[README.md](./README.md)**.
