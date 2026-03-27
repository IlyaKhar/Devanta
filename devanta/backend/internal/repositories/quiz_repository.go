package repositories

import (
	"devanta/backend/internal/models"
	"gorm.io/gorm"
)

type QuizRepository struct {
	db *gorm.DB
}

func NewQuizRepository(db *gorm.DB) *QuizRepository {
	return &QuizRepository{db: db}
}

func (r *QuizRepository) ListByModuleID(moduleID uint) ([]models.QuizQuestion, error) {
	var rows []models.QuizQuestion
	err := r.db.Where("module_id = ?", moduleID).Order("id ASC").Find(&rows).Error
	return rows, err
}
