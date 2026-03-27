package repository

import (
	"devanta/support-bot/internal/models"
	"gorm.io/gorm"
)

type TicketRepository struct {
	db *gorm.DB
}

func NewTicketRepository(db *gorm.DB) *TicketRepository {
	return &TicketRepository{db: db}
}

func (r *TicketRepository) Create(t models.Ticket) (*models.Ticket, error) {
	if err := r.db.Create(&t).Error; err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *TicketRepository) ListRecent(limit int) ([]models.Ticket, error) {
	if limit <= 0 {
		limit = 10
	}
	var rows []models.Ticket
	if err := r.db.Order("id desc").Limit(limit).Find(&rows).Error; err != nil {
		return nil, err
	}
	return rows, nil
}

func (r *TicketRepository) GetByID(id uint) (*models.Ticket, error) {
	var row models.Ticket
	if err := r.db.Where("id = ?", id).First(&row).Error; err != nil {
		return nil, err
	}
	return &row, nil
}

func (r *TicketRepository) UpdateStatus(id uint, status string) error {
	return r.db.Model(&models.Ticket{}).Where("id = ?", id).Update("status", status).Error
}

