package models

import "time"

type User struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	TelegramID int64     `gorm:"uniqueIndex;not null" json:"telegramId"`
	Username   string    `gorm:"default:''" json:"username"`
	FirstName  string    `gorm:"default:''" json:"firstName"`
	LastName   string    `gorm:"default:''" json:"lastName"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

// TableName — отдельная таблица от web-users (backend), иначе AutoMigrate ломает существующих пользователей.
func (User) TableName() string {
	return "support_telegram_users"
}

type Ticket struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"index;not null" json:"userId"`
	Text      string    `gorm:"type:text;not null" json:"text"`
	Status    string    `gorm:"type:varchar(20);default:open" json:"status"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type Message struct {
	ID uint `gorm:"primaryKey" json:"id"`

	UserID uint `gorm:"index;not null" json:"userId"`

	FromRole string `gorm:"type:varchar(20);not null" json:"fromRole"` // user|admin
	ToRole   string `gorm:"type:varchar(20);not null" json:"toRole"`   // user|admin

	Text string `gorm:"type:text;not null" json:"text"`

	// Для reply-логики
	AdminTelegramID int64 `gorm:"index;default:0" json:"adminTelegramId"`

	// Сообщение пользователя, которое мы получили
	UserTelegramMessageID int `gorm:"default:0" json:"userTelegramMessageId"`

	// Сообщение, которое бот отправил админу (чтобы поймать reply)
	AdminTelegramMessageID int `gorm:"default:0" json:"adminTelegramMessageId"`

	CreatedAt time.Time `json:"createdAt"`
}

