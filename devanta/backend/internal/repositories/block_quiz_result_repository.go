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

func (r *BlockQuizResultRepository) Upsert(userID, moduleID uint, blockIndex, lessonInBlock, scorePercent int, passed bool) error {
	var row models.BlockQuizResult
	err := r.db.Where("user_id = ? AND module_id = ? AND block_index = ? AND lesson_in_block = ?", userID, moduleID, blockIndex, lessonInBlock).First(&row).Error
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
		UserID:        userID,
		ModuleID:      moduleID,
		BlockIndex:    blockIndex,
		LessonInBlock: lessonInBlock,
		ScorePercent:  scorePercent,
		Passed:        passed,
		Attempts:      1,
	}).Error
}

// PassedSlotMap — blockIndex -> lessonInBlock -> прошёл ли тест этого урока.
func (r *BlockQuizResultRepository) PassedSlotMap(userID, moduleID uint) (map[int]map[int]bool, error) {
	var rows []models.BlockQuizResult
	if err := r.db.Where("user_id = ? AND module_id = ?", userID, moduleID).Find(&rows).Error; err != nil {
		return nil, err
	}
	out := make(map[int]map[int]bool)
	for _, row := range rows {
		if !row.Passed {
			continue
		}
		if out[row.BlockIndex] == nil {
			out[row.BlockIndex] = make(map[int]bool)
		}
		out[row.BlockIndex][row.LessonInBlock] = true
	}
	return out, nil
}

// CountPassedQuizzes — сколько блоков с тестами сдано успешно (для ачивки «ветеран тестов»).
func (r *BlockQuizResultRepository) CountPassedQuizzes(userID uint) (int64, error) {
	var n int64
	err := r.db.Model(&models.BlockQuizResult{}).
		Where("user_id = ? AND passed = ?", userID, true).
		Count(&n).Error
	return n, err
}
