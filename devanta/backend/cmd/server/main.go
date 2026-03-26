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
	svc := services.NewContainer(cfg, db)

	app := fiber.New()
	routes.Register(app, svc)

	log.Printf("backend started on :%s", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}
