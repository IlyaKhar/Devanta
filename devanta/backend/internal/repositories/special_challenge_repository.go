package repositories

import (
	"devanta/backend/internal/models"
	"gorm.io/gorm"
)

type SpecialChallengeRepository struct {
	db *gorm.DB
}

func NewSpecialChallengeRepository(db *gorm.DB) *SpecialChallengeRepository {
	return &SpecialChallengeRepository{db: db}
}

func (r *SpecialChallengeRepository) ListAll() ([]models.SpecialChallenge, error) {
	var rows []models.SpecialChallenge
	err := r.db.Order("sort_order ASC, id ASC").Find(&rows).Error
	return rows, err
}
