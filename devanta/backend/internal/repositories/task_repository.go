package repositories

import (
	"devanta/backend/internal/models"
	"gorm.io/gorm"
)

type TaskRepository struct {
	db *gorm.DB
}

func NewTaskRepository(db *gorm.DB) *TaskRepository {
	return &TaskRepository{db: db}
}

func (r *TaskRepository) ListAll() ([]models.Task, error) {
	var tasks []models.Task
	err := r.db.Order("id ASC").Find(&tasks).Error
	return tasks, err
}

func (r *TaskRepository) GetByID(id uint) (*models.Task, error) {
	var task models.Task
	if err := r.db.First(&task, id).Error; err != nil {
		return nil, err
	}
	return &task, nil
}

func (r *TaskRepository) GetFirstByLessonID(lessonID uint) (*models.Task, error) {
	var task models.Task
	if err := r.db.Where("lesson_id = ?", lessonID).Order("id ASC").First(&task).Error; err != nil {
		return nil, err
	}
	return &task, nil
}
