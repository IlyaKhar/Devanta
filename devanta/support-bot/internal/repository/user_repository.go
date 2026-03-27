package repository

import (
	"errors"

	"devanta/support-bot/internal/models"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) UpsertByTelegramID(user models.User) (*models.User, error) {
	if user.TelegramID == 0 {
		return nil, errors.New("telegram id is required")
	}

	var row models.User
	err := r.db.Where("telegram_id = ?", user.TelegramID).First(&row).Error
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		row = user
		if err := r.db.Create(&row).Error; err != nil {
			return nil, err
		}
		return &row, nil
	}

	updates := map[string]any{
		"username":   user.Username,
		"first_name": user.FirstName,
		"last_name":  user.LastName,
	}
	if err := r.db.Model(&row).Updates(updates).Error; err != nil {
		return nil, err
	}
	return &row, nil
}

func (r *UserRepository) GetByTelegramID(telegramID int64) (*models.User, error) {
	var row models.User
	if err := r.db.Where("telegram_id = ?", telegramID).First(&row).Error; err != nil {
		return nil, err
	}
	return &row, nil
}

func (r *UserRepository) GetByID(id uint) (*models.User, error) {
	var row models.User
	if err := r.db.Where("id = ?", id).First(&row).Error; err != nil {
		return nil, err
	}
	return &row, nil
}

