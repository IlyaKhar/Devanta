package handlers

import (
	"devanta/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

type AuthHandler struct {
	services *services.Container
}

func NewAuthHandler(s *services.Container) *AuthHandler {
	return &AuthHandler{services: s}
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		Age      int    `json:"age"`
	}
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid payload")
	}
	if err := h.services.AuthService.Register(req.Email, req.Password, req.Age); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(fiber.Map{"message": "registered"})
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid payload")
	}
	token, err := h.services.AuthService.Login(req.Email, req.Password)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}
	return c.JSON(fiber.Map{"accessToken": token})
}

func (h *AuthHandler) Refresh(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "refresh endpoint placeholder"})
}
