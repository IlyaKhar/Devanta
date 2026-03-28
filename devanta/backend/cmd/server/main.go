package main

import (
	"log"

	"devanta/backend/internal/config"
	"devanta/backend/internal/database"
	"devanta/backend/internal/routes"
	"devanta/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

func main() {
	cfg := config.Load()
	db := database.Connect(cfg.DatabaseURL)
	if err := database.EnsureUserSchema(db); err != nil {
		log.Fatalf("user schema: %v", err)
	}
	svc := services.NewContainer(cfg, db)

	app := fiber.New(fiber.Config{BodyLimit: 8 * 1024 * 1024})
	routes.RegisterUploads(app)
	routes.Register(app, svc)

	log.Printf("backend started on :%s | Swagger: /swagger/ или /api/swagger/ (спека: /openapi.yaml)", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}
