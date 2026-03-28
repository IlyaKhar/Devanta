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

// ListByModuleBlockLesson — вопросы для конкретного урока внутри блока (слот 1..3).
func (r *QuizRepository) ListByModuleBlockLesson(moduleID uint, blockIndex, lessonInBlock int) ([]models.QuizQuestion, error) {
	var rows []models.QuizQuestion
	err := r.db.Where("module_id = ? AND block_index = ? AND lesson_in_block = ?", moduleID, blockIndex, lessonInBlock).
		Order("id ASC").Find(&rows).Error
	return rows, err
}
