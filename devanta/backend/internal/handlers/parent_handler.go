package handlers

import (
	"errors"
	"strconv"
	"strings"
	"time"

	"devanta/backend/internal/config"
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

func resolvePublicAppBase(c *fiber.Ctx, cfg config.Config) string {
	if u := strings.TrimSpace(cfg.PublicAppURL); u != "" {
		return strings.TrimRight(u, "/")
	}
	scheme := "http"
	if c.Protocol() == "https" || strings.EqualFold(c.Get("X-Forwarded-Proto"), "https") {
		scheme = "https"
	}
	host := strings.TrimSpace(c.Get("X-Forwarded-Host"))
	if i := strings.IndexByte(host, ','); i >= 0 {
		host = strings.TrimSpace(host[:i])
	}
	if host == "" {
		host = strings.TrimSpace(c.Get("Host"))
	}
	if host == "" {
		return strings.TrimRight(firstOriginParent(cfg.CORSOrigin), "/")
	}
	return scheme + "://" + host
}

func (h *ParentHandler) GetInvite(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok || userID == 0 {
		return fiber.NewError(fiber.StatusUnauthorized, "missing token")
	}
	student, err := h.services.UserRepo.GetByID(userID)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "user not found")
	}
	if r := strings.TrimSpace(student.Role); r != "" && r != "student" {
		return fiber.NewError(fiber.StatusForbidden, "only students can create parent invites")
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

	base := resolvePublicAppBase(c, h.services.Config)
	if base == "" {
		base = "http://localhost:5173"
	}
	link := base + "/parent/connect?token=" + signedToken

	return c.JSON(fiber.Map{
		"inviteLink": link,
		"expiresAt":  expiresAt.UTC().Format(time.RFC3339),
	})
}

// PreviewInvite — только проверка ссылки (без записи в БД).
func (h *ParentHandler) PreviewInvite(c *fiber.Ctx) error {
	tokenString := strings.TrimSpace(c.Query("token"))
	if tokenString == "" {
		return fiber.NewError(fiber.StatusBadRequest, "token is required")
	}
	claims, err := parseInviteToken(tokenString, h.services.Config.JWTSecret)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	studentUserID, err := uintFromJWTSub(claims["sub"])
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid token payload")
	}
	student, studentErr := h.services.UserRepo.GetByID(studentUserID)
	if studentErr != nil {
		return fiber.NewError(fiber.StatusNotFound, "student not found")
	}
	return c.JSON(fiber.Map{
		"valid":         true,
		"studentUserId": studentUserID,
		"studentName":   displayNameParent(student),
	})
}

// AcceptInvite — привязка: только JWT с ролью parent + тело с токеном приглашения.
func (h *ParentHandler) AcceptInvite(c *fiber.Ctx) error {
	parentID, ok := c.Locals("userID").(uint)
	if !ok || parentID == 0 {
		return fiber.NewError(fiber.StatusUnauthorized, "missing token")
	}
	role, _ := c.Locals("role").(string)
	if role != "parent" {
		return fiber.NewError(fiber.StatusForbidden, "parent role required")
	}
	var req struct {
		InviteToken string `json:"inviteToken"`
	}
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid payload")
	}
	tokenString := strings.TrimSpace(req.InviteToken)
	if tokenString == "" {
		return fiber.NewError(fiber.StatusBadRequest, "inviteToken is required")
	}
	claims, err := parseInviteToken(tokenString, h.services.Config.JWTSecret)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	studentUserID, err := uintFromJWTSub(claims["sub"])
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid token payload")
	}
	if studentUserID == parentID {
		return fiber.NewError(fiber.StatusBadRequest, "cannot link to yourself")
	}
	student, err := h.services.UserRepo.GetByID(studentUserID)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "student not found")
	}
	if r := strings.TrimSpace(student.Role); r != "" && r != "student" {
		return fiber.NewError(fiber.StatusBadRequest, "invite target is not a student")
	}

	if err := h.services.ParentConnectionRepo.UpsertPair(studentUserID, parentID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot save connection")
	}
	return c.JSON(fiber.Map{
		"studentUserId": studentUserID,
		"studentName":   displayNameParent(student),
	})
}

func (h *ParentHandler) ListChildren(c *fiber.Ctx) error {
	parentID, ok := c.Locals("userID").(uint)
	role, _ := c.Locals("role").(string)
	if !ok || role != "parent" {
		return fiber.NewError(fiber.StatusForbidden, "parent only")
	}
	rows, err := h.services.ParentConnectionRepo.ListByParent(parentID)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot list children")
	}
	items := make([]fiber.Map, 0, len(rows))
	for _, row := range rows {
		st, err := h.services.UserRepo.GetByID(row.StudentUserID)
		if err != nil {
			continue
		}
		items = append(items, fiber.Map{
			"studentUserId": row.StudentUserID,
			"studentName":   displayNameParent(st),
			"connectedAt":   row.CreatedAt.UTC().Format(time.RFC3339),
		})
	}
	return c.JSON(fiber.Map{"items": items})
}

func (h *ParentHandler) ChildProgress(c *fiber.Ctx) error {
	parentID, ok := c.Locals("userID").(uint)
	role, _ := c.Locals("role").(string)
	if !ok || role != "parent" {
		return fiber.NewError(fiber.StatusForbidden, "parent only")
	}
	studentID64, err := strconv.ParseUint(strings.TrimSpace(c.Params("studentId")), 10, 64)
	if err != nil || studentID64 == 0 {
		return fiber.NewError(fiber.StatusBadRequest, "invalid studentId")
	}
	studentID := uint(studentID64)
	okPair, err := h.services.ParentConnectionRepo.ExistsPair(studentID, parentID)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot verify connection")
	}
	if !okPair {
		return fiber.NewError(fiber.StatusForbidden, "no access to this student")
	}
	summary, err := buildStudentProgressMap(h.services, studentID, false)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "student not found")
	}
	activity, err := buildStudentActivityItems(h.services, studentID, 10)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot load activity")
	}
	return c.JSON(fiber.Map{
		"summary":  summary,
		"activity": activity,
	})
}

func (h *ParentHandler) ListConnections(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok || userID == 0 {
		return fiber.NewError(fiber.StatusUnauthorized, "missing token")
	}
	items, err := h.services.ParentConnectionRepo.ListByStudentWithParentEmails(userID)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot list connections")
	}
	out := make([]fiber.Map, 0, len(items))
	for _, it := range items {
		out = append(out, fiber.Map{
			"parentUserId":  it.ParentUserID,
			"parentEmail":   it.ParentEmail,
			"connectedAt":   it.ConnectedAt,
		})
	}
	return c.JSON(fiber.Map{"items": out})
}

func (h *ParentHandler) DeleteConnection(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok || userID == 0 {
		return fiber.NewError(fiber.StatusUnauthorized, "missing token")
	}
	raw := strings.TrimSpace(c.Query("parentUserId"))
	parentUserID64, err := strconv.ParseUint(raw, 10, 64)
	if err != nil || parentUserID64 == 0 {
		return fiber.NewError(fiber.StatusBadRequest, "parentUserId query is required")
	}
	if err := h.services.ParentConnectionRepo.DeletePair(userID, uint(parentUserID64)); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot delete connection")
	}
	return c.JSON(fiber.Map{"status": "deleted"})
}

func firstOriginParent(origins string) string {
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

func uintFromJWTSub(v interface{}) (uint, error) {
	switch t := v.(type) {
	case float64:
		if t <= 0 {
			return 0, errors.New("invalid sub")
		}
		return uint(t), nil
	default:
		return 0, errors.New("invalid sub")
	}
}

func displayNameParent(user *models.User) string {
	if strings.TrimSpace(user.FullName) != "" {
		return strings.TrimSpace(user.FullName)
	}
	parts := strings.Split(strings.TrimSpace(user.Email), "@")
	if len(parts) > 0 && strings.TrimSpace(parts[0]) != "" {
		return parts[0]
	}
	return "Студент"
}
