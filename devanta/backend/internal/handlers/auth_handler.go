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

func (h *AuthHandler) RegisterParent(c *fiber.Ctx) error {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid payload")
	}
	if err := h.services.AuthService.RegisterParent(req.Email, req.Password); err != nil {
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
	tokens, err := h.services.AuthService.Login(req.Email, req.Password)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}

	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    tokens.RefreshToken,
		HTTPOnly: true,
		Secure:   h.services.Config.AppEnv == "production",
		SameSite: "lax",
		Path:     "/",
		MaxAge:   60 * 60 * 24 * 7,
	})

	return c.JSON(fiber.Map{"accessToken": tokens.AccessToken})
}

func (h *AuthHandler) Refresh(c *fiber.Ctx) error {
	refreshToken := c.Cookies("refresh_token")
	if refreshToken == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "missing refresh token")
	}

	accessToken, err := h.services.AuthService.Refresh(refreshToken)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}
	return c.JSON(fiber.Map{"accessToken": accessToken})
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    "",
		HTTPOnly: true,
		Secure:   h.services.Config.AppEnv == "production",
		SameSite: "lax",
		Path:     "/",
		MaxAge:   -1,
	})
	return c.JSON(fiber.Map{"message": "logged out"})
}
