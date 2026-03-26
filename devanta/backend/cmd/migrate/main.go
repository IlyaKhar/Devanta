package main

import (
	"fmt"
	"log"
	"os"

	"devanta/backend/internal/config"
	"devanta/backend/internal/database"
)

func main() {
	if len(os.Args) < 2 {
		log.Fatal("usage: migrate [up|down]")
	}

	cfg := config.Load()
	db := database.Connect(cfg.DatabaseURL)

	switch os.Args[1] {
	case "up":
		if err := database.RunUpMigrations(db); err != nil {
			log.Fatal(err)
		}
		fmt.Println("migrations up applied")
	case "down":
		if err := database.RunDownMigrations(db); err != nil {
			log.Fatal(err)
		}
		fmt.Println("migrations down applied")
	default:
		log.Fatal("unknown command")
	}
}
