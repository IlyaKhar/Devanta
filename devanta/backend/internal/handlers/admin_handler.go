package handlers

import (
	"strings"
	"time"

	"devanta/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

type AdminHandler struct {
	services *services.Container
}

func NewAdminHandler(s *services.Container) *AdminHandler {
	return &AdminHandler{services: s}
}

// adminUserDTO — без пароля и служебных полей.
type adminUserDTO struct {
	ID        uint      `json:"id"`
	Email     string    `json:"email"`
	FullName  string    `json:"fullName"`
	Username  string    `json:"username"`
	Role      string    `json:"role"`
	Blocked   bool      `json:"blocked"`
	Age       int       `json:"age"`
	Coins     int       `json:"coins"`
	CreatedAt time.Time `json:"createdAt"`
}

func (h *AdminHandler) GetUsers(c *fiber.Ctx) error {
	users, err := h.services.UserRepo.List()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	out := make([]adminUserDTO, 0, len(users))
	for _, u := range users {
		out = append(out, adminUserDTO{
			ID:        u.ID,
			Email:     u.Email,
			FullName:  u.FullName,
			Username:  u.Username,
			Role:      u.Role,
			Blocked:   u.Blocked,
			Age:       u.Age,
			Coins:     u.Coins,
			CreatedAt: u.CreatedAt,
		})
	}
	return c.JSON(out)
}

func (h *AdminHandler) Block(c *fiber.Ctx) error {
	var req struct {
		UserID  uint `json:"userId"`
		Blocked bool `json:"blocked"`
	}
	if err := c.BodyParser(&req); err != nil || req.UserID == 0 {
		return fiber.NewError(fiber.StatusBadRequest, `нужен JSON {"userId":1,"blocked":true}`)
	}
	actor, _ := c.Locals("userID").(uint)
	if req.UserID == actor && req.Blocked {
		return fiber.NewError(fiber.StatusBadRequest, "нельзя заблокировать себя")
	}
	if _, err := h.services.UserRepo.GetByID(req.UserID); err != nil {
		return fiber.NewError(fiber.StatusNotFound, "user not found")
	}
	if err := h.services.UserRepo.UpdateByID(req.UserID, map[string]interface{}{"blocked": req.Blocked}); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"ok": true, "userId": req.UserID, "blocked": req.Blocked})
}

func (h *AdminHandler) Role(c *fiber.Ctx) error {
	var req struct {
		UserID uint   `json:"userId"`
		Role   string `json:"role"`
	}
	if err := c.BodyParser(&req); err != nil || req.UserID == 0 {
		return fiber.NewError(fiber.StatusBadRequest, `нужен JSON {"userId":1,"role":"student"}`)
	}
	role := strings.ToLower(strings.TrimSpace(req.Role))
	if !allowedStaffRoles[role] {
		return fiber.NewError(fiber.StatusBadRequest, "role must be student|parent|moderator|admin")
	}
	actor, _ := c.Locals("userID").(uint)
	if req.UserID == actor && role != "admin" {
		return fiber.NewError(fiber.StatusBadRequest, "нельзя снять с себя роль admin")
	}
	if _, err := h.services.UserRepo.GetByID(req.UserID); err != nil {
		return fiber.NewError(fiber.StatusNotFound, "user not found")
	}
	if err := h.services.UserRepo.UpdateByID(req.UserID, map[string]interface{}{"role": role}); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"ok": true, "userId": req.UserID, "role": role})
}

var allowedStaffRoles = map[string]bool{
	"student": true, "parent": true, "moderator": true, "admin": true,
}
