package handlers

import (
	"errors"
	"strings"
	"time"

	"devanta/backend/internal/models"
	"devanta/backend/internal/services"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type ParentHandler struct {
	services *services.Container
}

func NewParentHandler(s *services.Container) *ParentHandler {
	return &ParentHandler{services: s}
}

func (h *ParentHandler) GetInvite(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok || userID == 0 {
		return fiber.NewError(fiber.StatusUnauthorized, "missing token")
	}

	expiresAt := time.Now().Add(7 * 24 * time.Hour)
	claims := jwt.MapClaims{
		"sub": userID,
		"typ": "parent_invite",
		"exp": expiresAt.Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(h.services.Config.JWTSecret))
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot create invite")
	}

	base := firstOrigin(h.services.Config.CORSOrigin)
	if base == "" {
		base = "http://localhost:5173"
	}
	link := strings.TrimRight(base, "/") + "/parent/connect?token=" + signedToken

	return c.JSON(fiber.Map{
		"inviteLink": link,
		"expiresAt":  expiresAt.UTC().Format(time.RFC3339),
	})
}

func (h *ParentHandler) Connect(c *fiber.Ctx) error {
	tokenString := strings.TrimSpace(c.Query("token"))
	parentContact := strings.TrimSpace(c.Query("parent"))
	if tokenString == "" {
		return fiber.NewError(fiber.StatusBadRequest, "token is required")
	}

	claims, err := parseInviteToken(tokenString, h.services.Config.JWTSecret)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	subFloat, ok := claims["sub"].(float64)
	if !ok || subFloat <= 0 {
		return fiber.NewError(fiber.StatusBadRequest, "invalid token payload")
	}
	studentUserID := uint(subFloat)

	if parentContact != "" {
		if err := h.services.ParentConnectionRepo.CreateIfNotExists(studentUserID, parentContact); err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "cannot connect parent")
		}
	}
	student, studentErr := h.services.UserRepo.GetByID(studentUserID)
	if studentErr != nil {
		return fiber.NewError(fiber.StatusNotFound, "student not found")
	}

	return c.JSON(fiber.Map{
		"valid":         true,
		"studentUserId": studentUserID,
		"studentName":   displayName(student),
		"connected":     parentContact != "",
	})
}

func firstOrigin(origins string) string {
	parts := strings.Split(origins, ",")
	for _, part := range parts {
		value := strings.TrimSpace(part)
		if value != "" {
			return value
		}
	}
	return ""
}

func parseInviteToken(tokenString, secret string) (jwt.MapClaims, error) {
	tkn, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil || !tkn.Valid {
		return nil, errors.New("invalid token")
	}
	claims, ok := tkn.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid claims")
	}
	tokenType, _ := claims["typ"].(string)
	if tokenType != "parent_invite" {
		return nil, errors.New("invalid token type")
	}
	return claims, nil
}

func displayName(user *models.User) string {
	if strings.TrimSpace(user.FullName) != "" {
		return strings.TrimSpace(user.FullName)
	}
	parts := strings.Split(strings.TrimSpace(user.Email), "@")
	if len(parts) > 0 && strings.TrimSpace(parts[0]) != "" {
		return parts[0]
	}
	return "Студент"
}
