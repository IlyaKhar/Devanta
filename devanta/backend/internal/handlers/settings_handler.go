package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"devanta/backend/internal/services"
	"devanta/backend/internal/util"
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
		"avatarUrl":          util.NormalizeAvatarURL(user.AvatarURL),
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
		"avatar_url": util.NormalizeAvatarURL(req.AvatarURL),
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

func avatarExtFromMIME(ct string) string {
	switch {
	case strings.Contains(ct, "jpeg"):
		return ".jpg"
	case strings.Contains(ct, "png"):
		return ".png"
	case strings.Contains(ct, "gif"):
		return ".gif"
	case strings.Contains(ct, "webp"):
		return ".webp"
	default:
		return ""
	}
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
	allowed := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
		".webp": true,
	}
	ext := strings.ToLower(filepath.Ext(file.Filename))
	uploadsRoot, absErr := filepath.Abs("uploads")
	if absErr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot resolve uploads path")
	}
	avatarsDir := filepath.Join(uploadsRoot, "avatars")
	if err := os.MkdirAll(avatarsDir, 0o755); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot prepare upload directory")
	}
	var finalPath string
	var filename string

	if allowed[ext] {
		filename = fmt.Sprintf("avatar_u%d_%d%s", userID, time.Now().UnixNano(), ext)
		finalPath = filepath.Join(avatarsDir, filename)
		if err := c.SaveFile(file, finalPath); err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "cannot save avatar")
		}
	} else {
		// Файлы без расширения / с «левым» именем: сохраняем во временный файл, тип — по сигнатуре.
		tmpPath := filepath.Join(avatarsDir, fmt.Sprintf("_tmp_u%d_%d", userID, time.Now().UnixNano()))
		if err := c.SaveFile(file, tmpPath); err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "cannot save avatar")
		}
		head, readErr := os.ReadFile(tmpPath)
		if readErr != nil || len(head) == 0 {
			_ = os.Remove(tmpPath)
			return fiber.NewError(fiber.StatusBadRequest, "empty avatar file")
		}
		n := len(head)
		if n > 512 {
			n = 512
		}
		ext = avatarExtFromMIME(http.DetectContentType(head[:n]))
		if !allowed[ext] {
			_ = os.Remove(tmpPath)
			return fiber.NewError(fiber.StatusBadRequest, "only jpg/jpeg/png/gif/webp allowed")
		}
		filename = fmt.Sprintf("avatar_u%d_%d%s", userID, time.Now().UnixNano(), ext)
		finalPath = filepath.Join(avatarsDir, filename)
		if err := os.Rename(tmpPath, finalPath); err != nil {
			_ = os.Remove(tmpPath)
			return fiber.NewError(fiber.StatusInternalServerError, "cannot finalize avatar")
		}
	}

	avatarURL := "/api/uploads/avatars/" + filename
	if err := h.services.UserRepo.UpdateByID(userID, map[string]interface{}{"avatar_url": avatarURL}); err != nil {
		_ = os.Remove(finalPath)
		return fiber.NewError(fiber.StatusInternalServerError, "cannot save avatar url")
	}
	oldAvatarURL := strings.TrimSpace(user.AvatarURL)
	if (strings.HasPrefix(oldAvatarURL, "/uploads/avatars/") || strings.HasPrefix(oldAvatarURL, "/api/uploads/avatars/")) &&
		oldAvatarURL != avatarURL {
		oldAvatarPath := filepath.Join(avatarsDir, filepath.Base(oldAvatarURL))
		_ = os.Remove(oldAvatarPath)
	}
	return c.JSON(fiber.Map{"avatarUrl": util.NormalizeAvatarURL(avatarURL)})
}
