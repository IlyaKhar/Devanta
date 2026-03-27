package repositories

import (
	"devanta/backend/internal/models"
	"gorm.io/gorm"
)

type LessonRepository struct {
	db *gorm.DB
}

func NewLessonRepository(db *gorm.DB) *LessonRepository {
	return &LessonRepository{db: db}
}

func (r *LessonRepository) ListByModuleID(moduleID uint) ([]models.Lesson, error) {
	var lessons []models.Lesson
	err := r.db.Where("module_id = ?", moduleID).Order("sort_order ASC, id ASC").Find(&lessons).Error
	return lessons, err
}

func (r *LessonRepository) GetByID(id uint) (*models.Lesson, error) {
	var lesson models.Lesson
	if err := r.db.First(&lesson, id).Error; err != nil {
		return nil, err
	}
	return &lesson, nil
}

func (r *LessonRepository) GetByModuleIDAndSortOrder(moduleID uint, sortOrder int) (*models.Lesson, error) {
	var lesson models.Lesson
	if err := r.db.Where("module_id = ? AND sort_order = ?", moduleID, sortOrder).First(&lesson).Error; err != nil {
		return nil, err
	}
	return &lesson, nil
}

func (r *LessonRepository) StatusesByUserAndModule(userID, moduleID uint) (map[uint]string, error) {
	type row struct {
		LessonID uint
		Status   string
	}
	var rows []row
	err := r.db.
		Table("user_progresses").
		Select("user_progresses.lesson_id, user_progresses.status").
		Joins("JOIN lessons ON lessons.id = user_progresses.lesson_id").
		Where("user_progresses.user_id = ? AND lessons.module_id = ?", userID, moduleID).
		Find(&rows).Error
	if err != nil {
		return nil, err
	}

	out := make(map[uint]string, len(rows))
	for _, item := range rows {
		current, ok := out[item.LessonID]
		if !ok || current != "completed" {
			out[item.LessonID] = item.Status
		}
	}
	return out, nil
}

func (r *LessonRepository) UpsertUserProgress(userID, lessonID uint, status string, score int) error {
	var row models.UserProgress
	err := r.db.Where("user_id = ? AND lesson_id = ?", userID, lessonID).First(&row).Error
	if err == nil {
		return r.db.Model(&row).Updates(map[string]interface{}{
			"status": status,
			"score":  score,
		}).Error
	}
	if err != gorm.ErrRecordNotFound {
		return err
	}
	return r.db.Create(&models.UserProgress{
		UserID:   userID,
		LessonID: lessonID,
		Status:   status,
		Score:    score,
	}).Error
}
