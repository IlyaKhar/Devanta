package repositories

import (
	"devanta/backend/internal/models"
	"gorm.io/gorm"
)

type BlockQuizResultRepository struct {
	db *gorm.DB
}

func NewBlockQuizResultRepository(db *gorm.DB) *BlockQuizResultRepository {
	return &BlockQuizResultRepository{db: db}
}

func (r *BlockQuizResultRepository) Upsert(userID, moduleID uint, blockIndex, scorePercent int, passed bool) error {
	var row models.BlockQuizResult
	err := r.db.Where("user_id = ? AND module_id = ? AND block_index = ?", userID, moduleID, blockIndex).First(&row).Error
	if err == nil {
		return r.db.Model(&row).Updates(map[string]interface{}{
			"score_percent": scorePercent,
			"passed":        passed,
			"attempts":      row.Attempts + 1,
		}).Error
	}
	if err != gorm.ErrRecordNotFound {
		return err
	}
	return r.db.Create(&models.BlockQuizResult{
		UserID:       userID,
		ModuleID:     moduleID,
		BlockIndex:   blockIndex,
		ScorePercent: scorePercent,
		Passed:       passed,
		Attempts:     1,
	}).Error
}

func (r *BlockQuizResultRepository) PassedMap(userID, moduleID uint) (map[int]bool, error) {
	var rows []models.BlockQuizResult
	if err := r.db.Where("user_id = ? AND module_id = ?", userID, moduleID).Find(&rows).Error; err != nil {
		return nil, err
	}
	out := make(map[int]bool, len(rows))
	for _, row := range rows {
		out[row.BlockIndex] = row.Passed
	}
	return out, nil
}
