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

type MeHandler struct {
	services *services.Container
}

func NewMeHandler(s *services.Container) *MeHandler {
	return &MeHandler{services: s}
}

func (h *MeHandler) Summary(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok || userID == 0 {
		return fiber.NewError(fiber.StatusUnauthorized, "missing token")
	}

	user, err := h.services.UserRepo.GetByID(userID)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "user not found")
	}

	totalXP, err := h.services.Gamification.TotalXPByUser(userID)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot load xp")
	}
	level := h.services.Gamification.LevelByXP(totalXP)

	achievements, _ := h.services.UserRepo.CountAchievements(userID)

	var lessonsCompleted int64
	_ = h.services.DB.Model(&models.UserProgress{}).
		Where("user_id = ? AND status = ?", userID, "completed").
		Count(&lessonsCompleted).Error

	var tasksSolved int64
	_ = h.services.DB.Model(&models.XPEvent{}).
		Where("user_id = ? AND source = ?", userID, "task_complete").
		Count(&tasksSolved).Error

	return c.JSON(fiber.Map{
		"fullName":         strings.TrimSpace(user.FullName),
		"username":         strings.TrimSpace(user.Username),
		"email":            user.Email,
		"avatarUrl":        util.NormalizeAvatarURL(user.AvatarURL),
		"xp":               totalXP,
		"level":            level,
		"tasksSolved":      tasksSolved,
		"lessonsCompleted": lessonsCompleted,
		"achievements":     achievements,
	})
}

func (h *MeHandler) Activity(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok || userID == 0 {
		return fiber.NewError(fiber.StatusUnauthorized, "missing token")
	}
	var rows []models.XPEvent
	if err := h.services.DB.Where("user_id = ?", userID).Order("created_at DESC, id DESC").Limit(10).Find(&rows).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot load activity")
	}

	items := make([]fiber.Map, 0, len(rows))
	for _, row := range rows {
		items = append(items, fiber.Map{
			"title": titleByXPSource(row.Source),
			"time":  row.CreatedAt.In(time.Local).Format("02.01 15:04"),
			"xp":    formatXP(row.XPDelta),
		})
	}
	return c.JSON(items)
}

func (h *MeHandler) Achievements(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok || userID == 0 {
		return fiber.NewError(fiber.StatusUnauthorized, "missing token")
	}

	type row struct {
		Title     string
		Code      string
		CreatedAt time.Time
	}
	var rows []row
	err := h.services.DB.
		Table("user_achievements").
		Select("achievements.title as title, achievements.code as code, user_achievements.created_at as created_at").
		Joins("JOIN achievements ON achievements.id = user_achievements.achievement_id").
		Where("user_achievements.user_id = ?", userID).
		Order("user_achievements.created_at DESC").
		Limit(12).
		Scan(&rows).Error
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot load achievements")
	}

	items := make([]fiber.Map, 0, len(rows))
	for _, r := range rows {
		items = append(items, fiber.Map{
			"title": r.Title,
			"code":  r.Code,
			"date":  r.CreatedAt.In(time.Local).Format("02.01.2006"),
		})
	}
	return c.JSON(items)
}

func titleByXPSource(source string) string {
	switch strings.ToLower(strings.TrimSpace(source)) {
	case "task_complete":
		return "Решил задачу"
	case "quiz_passed":
		return "Прошел тест"
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

