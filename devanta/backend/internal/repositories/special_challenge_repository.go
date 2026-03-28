package repositories

import (
	"devanta/backend/internal/models"
	"gorm.io/gorm"
)

type SpecialChallengeRepository struct {
	db *gorm.DB
}

func NewSpecialChallengeRepository(db *gorm.DB) *SpecialChallengeRepository {
	return &SpecialChallengeRepository{db: db}
}

func (r *SpecialChallengeRepository) ListAll() ([]models.SpecialChallenge, error) {
	var rows []models.SpecialChallenge
	err := r.db.Order("sort_order ASC, id ASC").Find(&rows).Error
	return rows, err
}

func (r *SpecialChallengeRepository) GetByCode(code string) (*models.SpecialChallenge, error) {
	var row models.SpecialChallenge
	if err := r.db.Where("code = ?", code).First(&row).Error; err != nil {
		return nil, err
	}
	return &row, nil
}

func (r *SpecialChallengeRepository) IsClaimed(userID uint, code string) (bool, error) {
	var n int64
	err := r.db.Model(&models.UserChallengeClaim{}).
		Where("user_id = ? AND code = ?", userID, code).
		Count(&n).Error
	return n > 0, err
}

// CreateClaim — вставка claim; при гонке вернёт ошибку уникального индекса.
func (r *SpecialChallengeRepository) CreateClaim(userID uint, code string) error {
	return r.db.Create(&models.UserChallengeClaim{UserID: userID, Code: code}).Error
}
