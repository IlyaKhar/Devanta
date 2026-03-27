package repositories

import (
	"devanta/backend/internal/models"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetByID(userID uint) (*models.User, error) {
	var user models.User
	if err := r.db.First(&user, userID).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) List() ([]models.User, error) {
	var users []models.User
	return users, r.db.Find(&users).Error
}

func (r *UserRepository) CountAchievements(userID uint) (int, error) {
	type result struct {
		Total int
	}
	var row result
	err := r.db.Table("user_achievements").
		Select("COUNT(*) AS total").
		Where("user_id = ?", userID).
		Scan(&row).Error
	return row.Total, err
}

func (r *UserRepository) UpdateByID(userID uint, updates map[string]interface{}) error {
	return r.db.Model(&models.User{}).Where("id = ?", userID).Updates(updates).Error
}

func (r *UserRepository) DeleteByID(userID uint) error {
	return r.db.Delete(&models.User{}, userID).Error
}

func (r *UserRepository) ExistsEmailExceptUser(email string, userID uint) (bool, error) {
	var count int64
	err := r.db.Model(&models.User{}).
		Where("email = ? AND id <> ?", email, userID).
		Count(&count).Error
	return count > 0, err
}

func (r *UserRepository) ExistsUsernameExceptUser(username string, userID uint) (bool, error) {
	var count int64
	err := r.db.Model(&models.User{}).
		Where("username = ? AND id <> ?", username, userID).
		Count(&count).Error
	return count > 0, err
}
