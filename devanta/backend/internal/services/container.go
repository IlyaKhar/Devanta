package services

import (
	"devanta/backend/internal/config"
	"devanta/backend/internal/repositories"
	"gorm.io/gorm"
)

type Container struct {
	Config       config.Config
	UserRepo     *repositories.UserRepository
	AuthService  *AuthService
	AIService    *AIService
	Gamification *GamificationService
}

func NewContainer(cfg config.Config, db *gorm.DB) *Container {
	userRepo := repositories.NewUserRepository(db)

	return &Container{
		Config:       cfg,
		UserRepo:     userRepo,
		AuthService:  NewAuthService(cfg.JWTSecret, userRepo),
		AIService:    NewAIService(cfg.YandexAPIKey),
		Gamification: NewGamificationService(db),
	}
}
