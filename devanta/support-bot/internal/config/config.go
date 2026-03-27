package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port string

	AppEnv string

	DatabaseURL string

	TelegramBotToken string
	Admins          []int64

	AboutText string

	WebhookPublicURL  string
	WebhookPath       string
	WebhookSecretToken string
}

func Load() Config {
	return Config{
		Port:             envOrDefault("SUPPORT_BOT_PORT", "8090"),
		AppEnv:           envOrDefault("APP_ENV", "development"),
		DatabaseURL:      envOrDefault("DATABASE_URL", ""),
		TelegramBotToken: envOrDefault("SUPPORT_TELEGRAM_BOT_TOKEN", ""),
		Admins:           parseAdmins(os.Getenv("SUPPORT_ADMINS")),
		AboutText: envOrDefault(
			"SUPPORT_ABOUT_TEXT",
			"Devanta — образовательная платформа для детей 7–15 лет. Напиши сюда, если нужна помощь.",
		),

		WebhookPublicURL:  strings.TrimRight(envOrDefault("SUPPORT_WEBHOOK_PUBLIC_URL", ""), "/"),
		WebhookPath:       envOrDefault("SUPPORT_WEBHOOK_PATH", "/telegram/webhook"),
		WebhookSecretToken: envOrDefault("SUPPORT_WEBHOOK_SECRET_TOKEN", ""),
	}
}

func envOrDefault(key, fallback string) string {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	return v
}

func parseAdmins(raw string) []int64 {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil
	}

	parts := strings.Split(raw, ",")
	out := make([]int64, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		id, err := strconv.ParseInt(p, 10, 64)
		if err != nil {
			continue
		}
		out = append(out, id)
	}
	return out
}

