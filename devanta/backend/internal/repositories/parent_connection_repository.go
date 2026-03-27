package repositories

import (
	"strings"

	"devanta/backend/internal/models"
	"gorm.io/gorm"
)

type ParentConnectionRepository struct {
	db *gorm.DB
}

func NewParentConnectionRepository(db *gorm.DB) *ParentConnectionRepository {
	return &ParentConnectionRepository{db: db}
}

func (r *ParentConnectionRepository) CreateIfNotExists(studentUserID uint, parentContact string) error {
	normalized := strings.ToLower(strings.TrimSpace(parentContact))
	if normalized == "" {
		return nil
	}
	row := models.ParentConnection{
		StudentUserID: studentUserID,
		ParentContact: normalized,
	}
	return r.db.Where("student_user_id = ? AND parent_contact = ?", row.StudentUserID, row.ParentContact).FirstOrCreate(&row).Error
}
