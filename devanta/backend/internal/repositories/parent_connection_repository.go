package repositories

import (
	"time"

	"devanta/backend/internal/models"
	"gorm.io/gorm"
)

type ParentConnectionRepository struct {
	db *gorm.DB
}

func NewParentConnectionRepository(db *gorm.DB) *ParentConnectionRepository {
	return &ParentConnectionRepository{db: db}
}

// UpsertPair — идемпотентная привязка ученика к аккаунту родителя.
func (r *ParentConnectionRepository) UpsertPair(studentUserID, parentUserID uint) error {
	row := models.ParentConnection{
		StudentUserID: studentUserID,
		ParentUserID:  parentUserID,
	}
	return r.db.Where("student_user_id = ? AND parent_user_id = ?", studentUserID, parentUserID).FirstOrCreate(&row).Error
}

func (r *ParentConnectionRepository) ExistsPair(studentUserID, parentUserID uint) (bool, error) {
	var n int64
	err := r.db.Model(&models.ParentConnection{}).
		Where("student_user_id = ? AND parent_user_id = ?", studentUserID, parentUserID).
		Count(&n).Error
	return n > 0, err
}

func (r *ParentConnectionRepository) ListByStudent(studentUserID uint) ([]models.ParentConnection, error) {
	var rows []models.ParentConnection
	err := r.db.Where("student_user_id = ?", studentUserID).Order("created_at ASC").Find(&rows).Error
	return rows, err
}

func (r *ParentConnectionRepository) ListByParent(parentUserID uint) ([]models.ParentConnection, error) {
	var rows []models.ParentConnection
	err := r.db.Where("parent_user_id = ?", parentUserID).Order("created_at ASC").Find(&rows).Error
	return rows, err
}

func (r *ParentConnectionRepository) DeletePair(studentUserID, parentUserID uint) error {
	return r.db.Where("student_user_id = ? AND parent_user_id = ?", studentUserID, parentUserID).
		Delete(&models.ParentConnection{}).Error
}

type ParentConnectionWithEmail struct {
	ParentUserID uint   `json:"parentUserId"`
	ParentEmail  string `json:"parentEmail"`
	ConnectedAt  string `json:"connectedAt"`
}

// ListByStudentWithParentEmails — для экрана ученика: email родителя из users.
func (r *ParentConnectionRepository) ListByStudentWithParentEmails(studentUserID uint) ([]ParentConnectionWithEmail, error) {
	rows, err := r.ListByStudent(studentUserID)
	if err != nil {
		return nil, err
	}
	out := make([]ParentConnectionWithEmail, 0, len(rows))
	for _, row := range rows {
		var u models.User
		if err := r.db.First(&u, row.ParentUserID).Error; err != nil {
			continue
		}
		out = append(out, ParentConnectionWithEmail{
			ParentUserID: row.ParentUserID,
			ParentEmail:  u.Email,
			ConnectedAt:  row.CreatedAt.UTC().Format(time.RFC3339),
		})
	}
	return out, nil
}
