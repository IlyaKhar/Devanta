package handlers

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"devanta/backend/internal/services"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type SettingsHandler struct {
	services *services.Container
}

var (
	emailRegexp    = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)
	usernameRegexp = regexp.MustCompile(`^[a-zA-Z0-9_]{3,24}$`)
)

func NewSettingsHandler(s *services.Container) *SettingsHandler {
	return &SettingsHandler{services: s}
}

func (h *SettingsHandler) GetProfile(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok || userID == 0 {
		return fiber.NewError(fiber.StatusUnauthorized, "missing token")
	}
	user, err := h.services.UserRepo.GetByID(userID)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "user not found")
	}
	return c.JSON(fiber.Map{
		"fullName":           user.FullName,
		"username":           user.Username,
		"email":              user.Email,
		"bio":                user.Bio,
		"avatarUrl":          user.AvatarURL,
		"emailNotifications": user.EmailNotifications,
		"pushNotifications":  user.PushNotifications,
	})
}

func (h *SettingsHandler) UpdateProfile(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok || userID == 0 {
		return fiber.NewError(fiber.StatusUnauthorized, "missing token")
	}
	var req struct {
		FullName  string `json:"fullName"`
		Username  string `json:"username"`
		Email     string `json:"email"`
		Bio       string `json:"bio"`
		AvatarURL string `json:"avatarUrl"`
	}
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid payload")
	}
	normalizedEmail := strings.ToLower(strings.TrimSpace(req.Email))
	normalizedUsername := strings.TrimSpace(req.Username)

	if normalizedEmail == "" {
		return fiber.NewError(fiber.StatusBadRequest, "email is required")
	}
	if !emailRegexp.MatchString(normalizedEmail) {
		return fiber.NewError(fiber.StatusBadRequest, "invalid email format")
	}
	if normalizedUsername == "" {
		return fiber.NewError(fiber.StatusBadRequest, "username is required")
	}
	if !usernameRegexp.MatchString(normalizedUsername) {
		return fiber.NewError(fiber.StatusBadRequest, "invalid username format")
	}
	emailTaken, err := h.services.UserRepo.ExistsEmailExceptUser(normalizedEmail, userID)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot validate email")
	}
	if emailTaken {
		return fiber.NewError(fiber.StatusBadRequest, "email is already in use")
	}
	usernameTaken, err := h.services.UserRepo.ExistsUsernameExceptUser(normalizedUsername, userID)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot validate username")
	}
	if usernameTaken {
		return fiber.NewError(fiber.StatusBadRequest, "username is already in use")
	}

	if err := h.services.UserRepo.UpdateByID(userID, map[string]interface{}{
		"full_name":  strings.TrimSpace(req.FullName),
		"username":   normalizedUsername,
		"email":      normalizedEmail,
		"bio":        strings.TrimSpace(req.Bio),
		"avatar_url": strings.TrimSpace(req.AvatarURL),
	}); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot update profile")
	}
	return c.JSON(fiber.Map{"status": "updated"})
}

func (h *SettingsHandler) UpdateNotifications(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok || userID == 0 {
		return fiber.NewError(fiber.StatusUnauthorized, "missing token")
	}
	var req struct {
		EmailNotifications bool `json:"emailNotifications"`
		PushNotifications  bool `json:"pushNotifications"`
	}
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid payload")
	}
	if err := h.services.UserRepo.UpdateByID(userID, map[string]interface{}{
		"email_notifications": req.EmailNotifications,
		"push_notifications":  req.PushNotifications,
	}); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot update notifications")
	}
	return c.JSON(fiber.Map{"status": "updated"})
}

func (h *SettingsHandler) ChangePassword(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok || userID == 0 {
		return fiber.NewError(fiber.StatusUnauthorized, "missing token")
	}
	var req struct {
		CurrentPassword string `json:"currentPassword"`
		NewPassword     string `json:"newPassword"`
	}
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid payload")
	}
	if len(req.NewPassword) < 6 {
		return fiber.NewError(fiber.StatusBadRequest, "new password too short")
	}
	user, err := h.services.UserRepo.GetByID(userID)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "user not found")
	}
	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.CurrentPassword)) != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "wrong current password")
	}
	hash, hashErr := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if hashErr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot change password")
	}
	if err := h.services.UserRepo.UpdateByID(userID, map[string]interface{}{"password": string(hash)}); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot change password")
	}
	return c.JSON(fiber.Map{"status": "password_changed"})
}

func (h *SettingsHandler) DeleteAccount(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok || userID == 0 {
		return fiber.NewError(fiber.StatusUnauthorized, "missing token")
	}
	if err := h.services.UserRepo.DeleteByID(userID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot delete account")
	}
	return c.JSON(fiber.Map{"status": "deleted"})
}

func (h *SettingsHandler) UploadAvatar(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok || userID == 0 {
		return fiber.NewError(fiber.StatusUnauthorized, "missing token")
	}
	file, err := c.FormFile("avatar")
	if err != nil || file == nil {
		return fiber.NewError(fiber.StatusBadRequest, "avatar file is required")
	}
	user, err := h.services.UserRepo.GetByID(userID)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "user not found")
	}
	if file.Size > 2*1024*1024 {
		return fiber.NewError(fiber.StatusBadRequest, "max avatar size is 2MB")
	}
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowed := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
		".webp": true,
	}
	if !allowed[ext] {
		return fiber.NewError(fiber.StatusBadRequest, "only jpg/jpeg/png/gif/webp allowed")
	}
	if err := os.MkdirAll(filepath.Join("uploads", "avatars"), 0o755); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot prepare upload directory")
	}
	filename := fmt.Sprintf("avatar_u%d_%d%s", userID, time.Now().UnixNano(), ext)
	savePath := filepath.Join("uploads", "avatars", filename)
	if err := c.SaveFile(file, savePath); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot save avatar")
	}
	avatarURL := "/uploads/avatars/" + filename
	if err := h.services.UserRepo.UpdateByID(userID, map[string]interface{}{"avatar_url": avatarURL}); err != nil {
		_ = os.Remove(savePath)
		return fiber.NewError(fiber.StatusInternalServerError, "cannot save avatar url")
	}
	oldAvatarURL := strings.TrimSpace(user.AvatarURL)
	if strings.HasPrefix(oldAvatarURL, "/uploads/avatars/") && oldAvatarURL != avatarURL {
		oldAvatarPath := filepath.Join("uploads", "avatars", filepath.Base(oldAvatarURL))
		_ = os.Remove(oldAvatarPath)
	}
	return c.JSON(fiber.Map{"avatarUrl": avatarURL})
}
