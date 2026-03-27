package repository

import (
	"devanta/support-bot/internal/models"
	"gorm.io/gorm"
)

type MessageRepository struct {
	db *gorm.DB
}

func NewMessageRepository(db *gorm.DB) *MessageRepository {
	return &MessageRepository{db: db}
}

func (r *MessageRepository) Create(msg models.Message) (*models.Message, error) {
	if err := r.db.Create(&msg).Error; err != nil {
		return nil, err
	}
	return &msg, nil
}

func (r *MessageRepository) FindByAdminReply(adminTelegramID int64, replyToAdminMessageID int) (*models.Message, error) {
	var row models.Message
	err := r.db.
		Where("admin_telegram_id = ? AND admin_telegram_message_id = ?", adminTelegramID, replyToAdminMessageID).
		Order("id desc").
		First(&row).Error
	if err != nil {
		return nil, err
	}
	return &row, nil
}

func (r *MessageRepository) ListRecentByUserID(userID uint, limit int) ([]models.Message, error) {
	if limit <= 0 {
		limit = 20
	}
	var rows []models.Message
	if err := r.db.Where("user_id = ?", userID).Order("id desc").Limit(limit).Find(&rows).Error; err != nil {
		return nil, err
	}
	return rows, nil
}

