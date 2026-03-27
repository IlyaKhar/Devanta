package services

import (
	"devanta/backend/internal/models"
	"gorm.io/gorm"
	"time"
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

func (s *GamificationService) TotalXPByUser(userID uint) (int, error) {
	type result struct {
		Total int
	}
	var row result
	err := s.db.Model(&models.XPEvent{}).
		Select("COALESCE(SUM(xp_delta), 0) AS total").
		Where("user_id = ?", userID).
		Scan(&row).Error
	return row.Total, err
}

func (s *GamificationService) WeeklyXPByUser(userID uint) (int, error) {
	type result struct {
		Total int
	}
	var row result
	since := time.Now().AddDate(0, 0, -7)
	err := s.db.Model(&models.XPEvent{}).
		Select("COALESCE(SUM(xp_delta), 0) AS total").
		Where("user_id = ? AND created_at >= ?", userID, since).
		Scan(&row).Error
	return row.Total, err
}
