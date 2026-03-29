# Технологический стек Devanta

Краткая сводка для документации и презентаций.

---

## Фронтенд (веб)

| Технология | Назначение |
|------------|------------|
| **React 18** | UI, компоненты |
| **TypeScript** | Типизация |
| **Vite 5** | Сборка и dev-сервер |
| **React Router 6** | Маршрутизация SPA |
| **Tailwind CSS 3** | Стили, адаптив |
| **Axios** | HTTP-клиент к API (`/api`) |
| **Zustand** | Состояние (токен, роль) |
| **Nginx** (в Docker) | Раздача статики SPA, `try_files` для client-side routing |

---

## Бэкенд (API)

| Технология | Назначение |
|------------|------------|
| **Go 1.22** | Язык сервера |
| **Fiber v2** | HTTP-фреймворк, middleware, JSON |
| **GORM** | ORM, миграции через `AutoMigrate`, PostgreSQL-драйвер |
| **JWT** (`golang-jwt/jwt/v5`) | Access/refresh токены, роли в claims |
| **bcrypt** (`golang.org/x/crypto`) | Хеширование паролей |
| **goja** | Выполнение JS на сервере для автопроверки задач |
| **Swagger** (`gofiber/swagger`) | Документация API (`/swagger/`, `openapi.yaml`) |

---

## База данных

| Технология | Назначение |
|------------|------------|
| **PostgreSQL 16** | Основное хранилище |
| **Схема** | GORM-модели + сид каталога (см. [DATABASE.md](./DATABASE.md)) |

---

## Инфраструктура и DevOps

| Технология | Назначение |
|------------|------------|
| **Docker** + **Docker Compose** | Контейнеры: postgres, backend, web, nginx, support-bot |
| **Nginx** (внешний в compose) | Reverse proxy: `/api` → backend, `/` → фронт, `/uploads`, Swagger |
| **Makefile** | `make start`, миграции, утилиты |

---

## Дополнительные сервисы

| Компонент | Стек |
|-----------|------|
| **Support-bot** (Telegram) | Go, Fiber (webhook), **telebot.v3**, GORM + Postgres |

---

## Сводка «одной строкой» для слайда

**Frontend:** React + TypeScript + Vite + Tailwind + React Router + Zustand + Axios  

**Backend:** Go + Fiber + GORM + PostgreSQL + JWT  

**Infra:** Docker Compose + Nginx  

**Дополнительно:** Telegram-бот (Go), Swagger/OpenAPI
