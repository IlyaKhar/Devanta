package handlers

import (
	"strconv"

	"devanta/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

type QuizHandler struct {
	services *services.Container
}

func NewQuizHandler(s *services.Container) *QuizHandler {
	return &QuizHandler{services: s}
}

func (h *QuizHandler) GetQuiz(c *fiber.Ctx) error {
	moduleID, _ := strconv.Atoi(c.Params("moduleId"))
	return c.JSON(fiber.Map{"moduleId": moduleID, "questions": []string{}})
}

func (h *QuizHandler) Submit(c *fiber.Ctx) error {
	_ = h.services.Gamification.AddXP(c.Locals("userID").(uint), "quiz_complete", 30)
	return c.JSON(fiber.Map{"status": "submitted", "xp": 30})
}
