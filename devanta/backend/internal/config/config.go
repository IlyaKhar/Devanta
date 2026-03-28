package config

import "os"

type Config struct {
	Port         string
	AppEnv       string
	DatabaseURL  string
	JWTSecret    string
	CORSOrigin   string
}

func Load() Config {
	return Config{
		Port:         envOrDefault("PORT", "8080"),
		AppEnv:       envOrDefault("APP_ENV", "development"),
		DatabaseURL:  envOrDefault("DATABASE_URL", "postgres://devanta:devanta@localhost:5432/devanta?sslmode=disable"),
		JWTSecret:    envOrDefault("JWT_SECRET", "change_me"),
		// Несколько origin через запятую: прод через nginx ( :80), Vite ( :5173), 127.0.0.1.
		CORSOrigin: envOrDefault(
			"CORS_ORIGIN",
			"http://localhost,http://localhost:5173,http://127.0.0.1,http://127.0.0.1:5173",
		),
	}
}

func envOrDefault(key, fallback string) string {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	return v
}
