package handlers

import (
	"strconv"
	"strings"
	"time"

	"devanta/backend/internal/models"
	"devanta/backend/internal/services"
	"devanta/backend/internal/util"
	"github.com/gofiber/fiber/v2"
)

// buildStudentProgressMap — единый JSON прогресса для /me/summary и родительского просмотра (без email, если includeEmail=false).
func buildStudentProgressMap(s *services.Container, userID uint, includeEmail bool) (fiber.Map, error) {
	user, err := s.UserRepo.GetByID(userID)
	if err != nil {
		return nil, err
	}
	totalXP, err := s.Gamification.TotalXPByUser(userID)
	if err != nil {
		return nil, err
	}
	level := s.Gamification.LevelByXP(totalXP)
	achievements, _ := s.UserRepo.CountAchievements(userID)

	var lessonsCompleted int64
	_ = s.DB.Model(&models.UserProgress{}).
		Where("user_id = ? AND status = ?", userID, "completed").
		Count(&lessonsCompleted).Error

	var tasksSolved int64
	_ = s.DB.Model(&models.XPEvent{}).
		Where("user_id = ? AND source = ?", userID, "task_complete").
		Count(&tasksSolved).Error

	m := fiber.Map{
		"fullName":         strings.TrimSpace(user.FullName),
		"username":         strings.TrimSpace(user.Username),
		"avatarUrl":        util.NormalizeAvatarURL(user.AvatarURL),
		"xp":               totalXP,
		"level":            level,
		"coins":            user.Coins,
		"tasksSolved":      tasksSolved,
		"lessonsCompleted": lessonsCompleted,
		"achievements":     achievements,
	}
	if includeEmail {
		m["email"] = user.Email
	}
	return m, nil
}

// buildStudentActivityItems — последние события XP (как в /me/activity).
func buildStudentActivityItems(s *services.Container, userID uint, limit int) ([]fiber.Map, error) {
	if limit <= 0 {
		limit = 10
	}
	var rows []models.XPEvent
	if err := s.DB.Where("user_id = ?", userID).Order("created_at DESC, id DESC").Limit(limit).Find(&rows).Error; err != nil {
		return nil, err
	}
	items := make([]fiber.Map, 0, len(rows))
	for _, row := range rows {
		items = append(items, fiber.Map{
			"title": titleByXPSource(row.Source),
			"time":  row.CreatedAt.In(time.Local).Format("02.01 15:04"),
			"xp":    formatXP(row.XPDelta),
		})
	}
	return items, nil
}

func titleByXPSource(source string) string {
	switch strings.ToLower(strings.TrimSpace(source)) {
	case "task_complete":
		return "Решил задачу"
	case "quiz_passed":
		return "Прошел тест"
	case "challenge_complete":
		return "Спецчеллендж"
	default:
		return "Активность"
	}
}

func formatXP(delta int) string {
	if delta >= 0 {
		return "+" + strconv.Itoa(delta) + " XP"
	}
	return strconv.Itoa(delta) + " XP"
}
