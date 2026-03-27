package repositories

import (
	"devanta/backend/internal/models"
	"gorm.io/gorm"
)

type ModuleRepository struct {
	db *gorm.DB
}

func NewModuleRepository(db *gorm.DB) *ModuleRepository {
	return &ModuleRepository{db: db}
}

func (r *ModuleRepository) ListAll() ([]models.Module, error) {
	var modules []models.Module
	err := r.db.Order("sort_order ASC, id ASC").Find(&modules).Error
	return modules, err
}

func (r *ModuleRepository) GetByID(id uint) (*models.Module, error) {
	var module models.Module
	if err := r.db.First(&module, id).Error; err != nil {
		return nil, err
	}
	return &module, nil
}

func (r *ModuleRepository) ListActiveByUser(userID uint) ([]models.Module, error) {
	var modules []models.Module
	err := r.db.
		Model(&models.Module{}).
		Joins("JOIN lessons ON lessons.module_id = modules.id").
		Joins("JOIN user_progresses ON user_progresses.lesson_id = lessons.id").
		Where("user_progresses.user_id = ?", userID).
		Distinct("modules.id, modules.title, modules.sort_order, modules.created_at").
		Order("modules.sort_order ASC, modules.id ASC").
		Find(&modules).Error
	return modules, err
}
