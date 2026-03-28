package handlers

import (
	"devanta/backend/internal/services"
	"github.com/gofiber/fiber/v2"
	"sort"
	"strings"
)

type ProgressHandler struct {
	services *services.Container
}

func NewProgressHandler(s *services.Container) *ProgressHandler {
	return &ProgressHandler{services: s}
}

func (h *ProgressHandler) GetProgress(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok || userID == 0 {
		return fiber.NewError(fiber.StatusUnauthorized, "missing token")
	}
	totalXP, err := h.services.Gamification.TotalXPByUser(userID)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot load xp")
	}
	return c.JSON(fiber.Map{"xp": totalXP, "level": h.services.Gamification.LevelByXP(totalXP)})
}

func (h *ProgressHandler) GetLeaderboard(c *fiber.Ctx) error {
	period := strings.ToLower(c.Query("period", "total"))
	if period != "total" && period != "week" {
		return fiber.NewError(fiber.StatusBadRequest, "period must be total or week")
	}

	currentUserID, _ := c.Locals("userID").(uint)
	users, err := h.services.UserRepo.List()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot load users")
	}

	type row struct {
		Name         string `json:"name"`
		XP           int    `json:"xp"`
		Level        int    `json:"level"`
		Achievements int    `json:"achievements"`
		IsMe         bool   `json:"isMe"`
	}

	rows := make([]row, 0, len(users)+8)
	for _, user := range users {
		totalXP, totalErr := h.services.Gamification.TotalXPByUser(user.ID)
		if totalErr != nil {
			continue
		}
		weeklyXP, weeklyErr := h.services.Gamification.WeeklyXPByUser(user.ID)
		if weeklyErr != nil {
			continue
		}
		achievements, achErr := h.services.UserRepo.CountAchievements(user.ID)
		if achErr != nil {
			achievements = 0
		}

		value := totalXP
		if period == "week" {
			value = weeklyXP
		}
		rows = append(rows, row{
			Name:         nameFromEmail(user.Email),
			XP:           value,
			Level:        h.services.Gamification.LevelByXP(totalXP),
			Achievements: achievements,
			IsMe:         currentUserID > 0 && currentUserID == user.ID,
		})
	}

	if len(rows) < 5 {
		demo := []row{
			{Name: "Анна К.", XP: periodXP(period, 2450), Level: 15, Achievements: 28},
			{Name: "Дмитрий М.", XP: periodXP(period, 2380), Level: 14, Achievements: 25},
			{Name: "София Л.", XP: periodXP(period, 2150), Level: 13, Achievements: 24},
			{Name: "Илья П.", XP: periodXP(period, 1980), Level: 12, Achievements: 22},
			{Name: "Елена В.", XP: periodXP(period, 1750), Level: 11, Achievements: 20},
			{Name: "Александр С.", XP: periodXP(period, 1650), Level: 10, Achievements: 18},
			{Name: "Мария И.", XP: periodXP(period, 1580), Level: 10, Achievements: 17},
		}
		rows = append(rows, demo...)
	}

	sort.Slice(rows, func(i, j int) bool { return rows[i].XP > rows[j].XP })
	return c.JSON(rows)
}

func periodXP(period string, base int) int {
	if period == "week" {
		return maxInt(80, int(float64(base)*0.18))
	}
	return base
}

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func nameFromEmail(email string) string {
	parts := strings.Split(email, "@")
	if len(parts) == 0 || parts[0] == "" {
		return "Ученик"
	}
	name := parts[0]
	first := strings.ToUpper(name[:1])
	if len(name) == 1 {
		return first
	}
	return first + name[1:]
}
