package database

import (
	"errors"
	"fmt"

	"devanta/backend/internal/models"
	"gorm.io/gorm"
)

// DemoCompleteCourse — для демо: все уроки модуля «completed», все слоты квизов сданы (открывается итог).
func DemoCompleteCourse(db *gorm.DB, userEmail string, moduleID uint) error {
	var user models.User
	if err := db.Where("email = ?", userEmail).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("пользователь с email %q не найден", userEmail)
		}
		return err
	}
	var mod models.Module
	if err := db.First(&mod, moduleID).Error; err != nil {
		return fmt.Errorf("модуль id=%d: %w", moduleID, err)
	}

	var lessons []models.Lesson
	if err := db.Where("module_id = ?", moduleID).Order("sort_order ASC, id ASC").Find(&lessons).Error; err != nil {
		return err
	}
	if len(lessons) == 0 {
		return fmt.Errorf("в модуле нет уроков")
	}

	for _, les := range lessons {
		if err := upsertLessonCompleted(db, user.ID, les.ID); err != nil {
			return err
		}
	}

	// Все тесты по урокам (блоки 1–10 × 3) + итог блок 11
	for b := 1; b <= 10; b++ {
		for l := 1; l <= 3; l++ {
			if err := upsertQuizPassed(db, user.ID, moduleID, b, l); err != nil {
				return err
			}
		}
	}
	if err := upsertQuizPassed(db, user.ID, moduleID, 11, 1); err != nil {
		return err
	}

	fmt.Printf("OK: пользователь %s — модуль «%s» (id=%d): %d уроков и все квизы отмечены пройденными.\n", userEmail, mod.Title, moduleID, len(lessons))
	return nil
}

func upsertLessonCompleted(db *gorm.DB, userID, lessonID uint) error {
	var row models.UserProgress
	err := db.Where("user_id = ? AND lesson_id = ?", userID, lessonID).First(&row).Error
	if err == nil {
		return db.Model(&row).Updates(map[string]interface{}{"status": "completed", "score": 100}).Error
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}
	return db.Create(&models.UserProgress{UserID: userID, LessonID: lessonID, Status: "completed", Score: 100}).Error
}

func upsertQuizPassed(db *gorm.DB, userID, moduleID uint, blockIndex, lessonInBlock int) error {
	var row models.BlockQuizResult
	err := db.Where("user_id = ? AND module_id = ? AND block_index = ? AND lesson_in_block = ?", userID, moduleID, blockIndex, lessonInBlock).First(&row).Error
	if err == nil {
		return db.Model(&row).Updates(map[string]interface{}{
			"score_percent": 100,
			"passed":        true,
			"attempts":      row.Attempts + 1,
		}).Error
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}
	return db.Create(&models.BlockQuizResult{
		UserID:        userID,
		ModuleID:      moduleID,
		BlockIndex:    blockIndex,
		LessonInBlock: lessonInBlock,
		ScorePercent:  100,
		Passed:        true,
		Attempts:      1,
	}).Error
}
