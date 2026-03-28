package handlers

import (
	"time"

	"devanta/backend/internal/services"
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
	m, err := buildStudentProgressMap(h.services, userID, true)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "user not found")
	}
	return c.JSON(m)
}

func (h *MeHandler) Activity(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok || userID == 0 {
		return fiber.NewError(fiber.StatusUnauthorized, "missing token")
	}
	items, err := buildStudentActivityItems(h.services, userID, 10)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot load activity")
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
