package handlers

import (
	"devanta/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

type ModerationHandler struct {
	services *services.Container
}

func NewModerationHandler(s *services.Container) *ModerationHandler {
	return &ModerationHandler{services: s}
}

func (h *ModerationHandler) GetReviews(c *fiber.Ctx) error {
	return c.JSON([]fiber.Map{{"id": 101, "status": "pending"}})
}

func (h *ModerationHandler) Publish(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"status": "published", "id": c.Params("id")})
}

func (h *ModerationHandler) Reject(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"status": "rejected", "id": c.Params("id")})
}
