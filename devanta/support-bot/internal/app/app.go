package app

import (
	"context"
	"fmt"
	"log"
	"time"

	botpkg "devanta/support-bot/internal/bot"
	"devanta/support-bot/internal/config"
	"devanta/support-bot/internal/database"
	"devanta/support-bot/internal/repository"
	"devanta/support-bot/internal/services"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/adaptor"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"gorm.io/gorm"
)

type App struct {
	cfg config.Config

	http *fiber.App

	db  *gorm.DB

	support *services.SupportService
}

func New(cfg config.Config) (*App, error) {
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		return nil, err
	}
	if err := database.Migrate(db); err != nil {
		return nil, err
	}

	httpApp := fiber.New()
	httpApp.Use(logger.New())
	httpApp.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	userRepo := repository.NewUserRepository(db)
	msgRepo := repository.NewMessageRepository(db)
	ticketRepo := repository.NewTicketRepository(db)
	fsm := services.NewFSM()
	supportSvc := services.NewSupportService(cfg, fsm, userRepo, msgRepo, ticketRepo)

	return &App{
		cfg:  cfg,
		http: httpApp,
		db:   db,
		support: supportSvc,
	}, nil
}

func (a *App) Run(ctx context.Context) error {
	errCh := make(chan error, 1)

	go func() {
		log.Printf("support-bot http started on :%s", a.cfg.Port)
		errCh <- a.http.Listen(fmt.Sprintf(":%s", a.cfg.Port))
	}()

	go func() {
		a.runTelegramLoop(ctx)
	}()

	select {
	case <-ctx.Done():
		_ = a.http.Shutdown()
		return nil
	case err := <-errCh:
		return err
	}
}

func (a *App) runTelegramLoop(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		default:
		}

		tgBot, err := botpkg.New(a.cfg, a.support)
		if err != nil {
			log.Printf("telegram init failed: %v", err)
			time.Sleep(10 * time.Second)
			continue
		}

		if h := tgBot.WebhookHandler(); h != nil {
			// Регистрируем handler динамически: Fiber позволяет добавить маршрут до первого запроса.
			a.http.Post(a.cfg.WebhookPath, adaptor.HTTPHandler(h))
		}

		tgBot.Start()

		// Если Start вернулся — пробуем перезапуск с задержкой.
		time.Sleep(2 * time.Second)
	}
}

