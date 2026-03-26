package handlers

import (
	"devanta/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

type ReviewHandler struct {
	services *services.Container
}

func NewReviewHandler(s *services.Container) *ReviewHandler {
	return &ReviewHandler{services: s}
}

func (h *ReviewHandler) GetReviews(c *fiber.Ctx) error {
	return c.JSON([]fiber.Map{
		{"id": 1, "text": "Очень круто!", "rating": 5, "status": "published"},
	})
}

func (h *ReviewHandler) CreateReview(c *fiber.Ctx) error {
	var req struct {
		Text   string `json:"text"`
		Rating int    `json:"rating"`
	}
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid payload")
	}
	return c.JSON(fiber.Map{"status": "pending", "text": req.Text, "rating": req.Rating})
}
