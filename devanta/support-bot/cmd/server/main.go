package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"devanta/support-bot/internal/app"
	"devanta/support-bot/internal/config"
)

func main() {
	cfg := config.Load()

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	a, err := app.New(cfg)
	if err != nil {
		log.Fatal(err)
	}

	go func() {
		if err := a.Run(ctx); err != nil {
			log.Fatal(err)
		}
	}()

	<-ctx.Done()
	log.Println("support-bot stopped")
	os.Exit(0)
}

