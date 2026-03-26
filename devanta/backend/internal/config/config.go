package config

import "os"

type Config struct {
	Port         string
	AppEnv       string
	DatabaseURL  string
	JWTSecret    string
	CORSOrigin   string
	YandexAPIKey string
}

func Load() Config {
	return Config{
		Port:         envOrDefault("PORT", "8080"),
		AppEnv:       envOrDefault("APP_ENV", "development"),
		DatabaseURL:  envOrDefault("DATABASE_URL", "postgres://devanta:devanta@localhost:5432/devanta?sslmode=disable"),
		JWTSecret:    envOrDefault("JWT_SECRET", "change_me"),
		CORSOrigin:   envOrDefault("CORS_ORIGIN", "http://localhost:5173"),
		YandexAPIKey: os.Getenv("YANDEX_API_KEY"),
	}
}

func envOrDefault(key, fallback string) string {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	return v
}
