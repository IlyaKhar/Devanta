package handlers

import (
	"devanta/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

type AIHandler struct {
	services *services.Container
}

func NewAIHandler(s *services.Container) *AIHandler {
	return &AIHandler{services: s}
}

func (h *AIHandler) Explain(c *fiber.Ctx) error {
	var req struct {
		Lesson string `json:"lesson"`
		Age    string `json:"age"`
	}
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid payload")
	}
	return c.JSON(fiber.Map{"message": h.services.AIService.Explain(req.Lesson, req.Age)})
}

func (h *AIHandler) Hint(c *fiber.Ctx) error {
	var req struct {
		Task          string `json:"task"`
		StudentAnswer string `json:"student_answer"`
	}
	_ = c.BodyParser(&req)
	return c.JSON(fiber.Map{"message": h.services.AIService.Hint(req.Task, req.StudentAnswer)})
}

func (h *AIHandler) Check(c *fiber.Ctx) error {
	var req struct {
		Task          string `json:"task"`
		StudentAnswer string `json:"student_answer"`
	}
	_ = c.BodyParser(&req)
	return c.JSON(fiber.Map{"message": h.services.AIService.Check(req.Task, req.StudentAnswer)})
}

func (h *AIHandler) Limits(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"dailyHintsLimit": 10, "remaining": 7})
}
