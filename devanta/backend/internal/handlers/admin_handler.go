package handlers

import (
	"devanta/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

type AdminHandler struct {
	services *services.Container
}

func NewAdminHandler(s *services.Container) *AdminHandler {
	return &AdminHandler{services: s}
}

func (h *AdminHandler) GetUsers(c *fiber.Ctx) error {
	users, err := h.services.UserRepo.List()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(users)
}

func (h *AdminHandler) Block(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"status": "blocked"})
}

func (h *AdminHandler) Role(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"status": "role_updated"})
}
