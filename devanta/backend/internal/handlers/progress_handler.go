package handlers

import (
	"devanta/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

type ProgressHandler struct {
	services *services.Container
}

func NewProgressHandler(s *services.Container) *ProgressHandler {
	return &ProgressHandler{services: s}
}

func (h *ProgressHandler) GetProgress(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"xp": 120, "level": h.services.Gamification.LevelByXP(120)})
}

func (h *ProgressHandler) GetLeaderboard(c *fiber.Ctx) error {
	return c.JSON([]fiber.Map{
		{"name": "Player1", "xp": 300},
		{"name": "Player2", "xp": 250},
	})
}
