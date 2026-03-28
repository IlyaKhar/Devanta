// Утилита демо: «прокачать» курс для пользователя (уроки + квизы), чтобы открыть итоговый тест без ручного прохождения.
//
// Локально из папки backend:
//
//	go run ./cmd/demo-complete -email=you@mail.com -module=1
//
// Через Docker (из папки devanta):
//
//	docker compose run --rm backend demo-complete -email=you@mail.com -module=1
package main

import (
	"flag"
	"log"
	"os"

	"devanta/backend/internal/config"
	"devanta/backend/internal/database"
)

func main() {
	email := flag.String("email", "", "email пользователя (обязательно)")
	moduleID := flag.Uint("module", 0, "id модуля из /modules (обязательно)")
	flag.Parse()
	if *email == "" || *moduleID == 0 {
		flag.Usage()
		os.Exit(1)
	}

	cfg := config.Load()
	db := database.Connect(cfg.DatabaseURL)
	if err := database.DemoCompleteCourse(db, *email, *moduleID); err != nil {
		log.Fatal(err)
	}
}
