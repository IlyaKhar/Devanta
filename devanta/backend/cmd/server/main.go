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
	if err := database.EnsureParentConnectionSchema(db); err != nil {
		log.Fatalf("parent_connections schema: %v", err)
	}
	if err := database.EnsureTaskSchema(db); err != nil {
		log.Fatalf("tasks schema: %v", err)
	}
	if err := database.EnsureQuizQuestionSchema(db); err != nil {
		log.Fatalf("quiz_questions schema: %v", err)
	}
	if err := database.EnsureBlockQuizResultSchema(db); err != nil {
		log.Fatalf("block_quiz_results schema: %v", err)
	}
	svc := services.NewContainer(cfg, db)

	app := fiber.New(fiber.Config{BodyLimit: 8 * 1024 * 1024})
	routes.RegisterUploads(app)
	routes.Register(app, svc)

	log.Printf("backend started on :%s | Swagger: /swagger/ или /api/swagger/ (спека: /openapi.yaml)", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}
