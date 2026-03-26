package handlers

import (
	"strconv"

	"devanta/backend/internal/models"
	"devanta/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

type LearningHandler struct {
	services *services.Container
}

func NewLearningHandler(s *services.Container) *LearningHandler {
	return &LearningHandler{services: s}
}

func (h *LearningHandler) GetModules(c *fiber.Ctx) error {
	return c.JSON([]models.Module{})
}

func (h *LearningHandler) GetLessons(c *fiber.Ctx) error {
	moduleID, _ := strconv.Atoi(c.Params("id"))
	return c.JSON(fiber.Map{"moduleId": moduleID, "lessons": []models.Lesson{}})
}

func (h *LearningHandler) GetLesson(c *fiber.Ctx) error {
	lessonID, _ := strconv.Atoi(c.Params("id"))
	return c.JSON(fiber.Map{"lessonId": lessonID, "content": "lesson content placeholder"})
}

func (h *LearningHandler) SubmitTask(c *fiber.Ctx) error {
	taskID, _ := strconv.Atoi(c.Params("id"))
	_ = h.services.Gamification.AddXP(c.Locals("userID").(uint), "task_complete", 20)
	return c.JSON(fiber.Map{"taskId": taskID, "status": "accepted", "xp": 20})
}
