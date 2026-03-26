package services

import (
	"devanta/backend/internal/models"
	"gorm.io/gorm"
)

type GamificationService struct {
	db *gorm.DB
}

func NewGamificationService(db *gorm.DB) *GamificationService {
	return &GamificationService{db: db}
}

func (s *GamificationService) AddXP(userID uint, source string, delta int) error {
	return s.db.Create(&models.XPEvent{
		UserID:  userID,
		Source:  source,
		XPDelta: delta,
	}).Error
}

func (s *GamificationService) LevelByXP(xp int) int {
	return xp / 100
}
