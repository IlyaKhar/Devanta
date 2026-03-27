package repositories

import (
	"devanta/backend/internal/models"
	"gorm.io/gorm"
)

type FAQRepository struct {
	db *gorm.DB
}

func NewFAQRepository(db *gorm.DB) *FAQRepository {
	return &FAQRepository{db: db}
}

func (r *FAQRepository) ListAll() ([]models.FAQEntry, error) {
	var rows []models.FAQEntry
	err := r.db.Order("category ASC, sort_order ASC, id ASC").Find(&rows).Error
	return rows, err
}

func (r *FAQRepository) Create(row *models.FAQEntry) error {
	return r.db.Create(row).Error
}

func (r *FAQRepository) UpdateByID(id uint, updates map[string]interface{}) error {
	return r.db.Model(&models.FAQEntry{}).Where("id = ?", id).Updates(updates).Error
}

func (r *FAQRepository) DeleteByID(id uint) error {
	return r.db.Delete(&models.FAQEntry{}, id).Error
}
