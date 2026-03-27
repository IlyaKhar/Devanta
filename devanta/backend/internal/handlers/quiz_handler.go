package handlers

import (
	"encoding/json"
	"strconv"

	"devanta/backend/internal/models"
	"devanta/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

type QuizHandler struct {
	services *services.Container
}

func NewQuizHandler(s *services.Container) *QuizHandler {
	return &QuizHandler{services: s}
}

type quizQuestionDTO struct {
	ID       uint     `json:"id"`
	Question string   `json:"question"`
	Options  []string `json:"options"`
}

func (h *QuizHandler) GetQuiz(c *fiber.Ctx) error {
	moduleID, err := strconv.Atoi(c.Params("moduleId"))
	if err != nil || moduleID <= 0 {
		return fiber.NewError(fiber.StatusBadRequest, "invalid module id")
	}
	blockIndex := c.QueryInt("block", 1)
	if blockIndex <= 0 {
		return fiber.NewError(fiber.StatusBadRequest, "invalid block index")
	}
	questions, qErr := h.loadQuestions(uint(moduleID), blockIndex)
	if qErr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot load quiz")
	}
	items := make([]quizQuestionDTO, 0, len(questions))
	for _, q := range questions {
		opts := parseOptions(q.Options)
		if len(opts) == 0 {
			opts = []string{"Вариант 1", "Вариант 2", "Вариант 3", "Вариант 4"}
		}
		items = append(items, quizQuestionDTO{
			ID:       q.ID,
			Question: q.Question,
			Options:  opts,
		})
	}
	return c.JSON(fiber.Map{"moduleId": moduleID, "blockIndex": blockIndex, "passThreshold": 70, "questions": items})
}

func (h *QuizHandler) Submit(c *fiber.Ctx) error {
	moduleID, err := strconv.Atoi(c.Params("moduleId"))
	if err != nil || moduleID <= 0 {
		return fiber.NewError(fiber.StatusBadRequest, "invalid module id")
	}
	userID, ok := c.Locals("userID").(uint)
	if !ok || userID == 0 {
		return fiber.NewError(fiber.StatusUnauthorized, "missing token")
	}
	var req struct {
		Answers map[string]int `json:"answers"`
	}
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid payload")
	}
	blockIndex := c.QueryInt("block", 1)
	if blockIndex <= 0 {
		return fiber.NewError(fiber.StatusBadRequest, "invalid block index")
	}

	questions, qErr := h.loadQuestions(uint(moduleID), blockIndex)
	if qErr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot check quiz")
	}
	if len(questions) == 0 {
		return fiber.NewError(fiber.StatusBadRequest, "quiz has no questions")
	}

	correct := 0
	for _, q := range questions {
		answer, exists := req.Answers[strconv.Itoa(int(q.ID))]
		if exists && answer == q.CorrectIdx {
			correct++
		}
	}
	total := len(questions)
	scorePercent := (correct * 100) / total
	passed := scorePercent >= 70

	xp := 0
	if passed {
		xp = 80
		_ = h.services.Gamification.AddXP(userID, "quiz_passed", xp)
	}
	_ = h.services.BlockQuizResultRepo.Upsert(userID, uint(moduleID), blockIndex, scorePercent, passed)

	return c.JSON(fiber.Map{
		"status":        "submitted",
		"moduleId":      moduleID,
		"blockIndex":    blockIndex,
		"passed":        passed,
		"scorePercent":  scorePercent,
		"correct":       correct,
		"total":         total,
		"passThreshold": 70,
		"xp":            xp,
	})
}

func (h *QuizHandler) loadQuestions(moduleID uint, blockIndex int) ([]models.QuizQuestion, error) {
	rows, err := h.services.QuizRepo.ListByModuleID(moduleID)
	if err != nil {
		return nil, err
	}
	if len(rows) > 0 {
		return rows, nil
	}
	seed := fallbackQuiz(moduleID, blockIndex)
	return seed, nil
}

func fallbackQuiz(moduleID uint, blockIndex int) []models.QuizQuestion {
	baseID := int(moduleID)*1000 + blockIndex*100
	return []models.QuizQuestion{
		{ID: uint(baseID + 1), ModuleID: moduleID, Question: "Что такое переменная в программировании?", Options: `["Постоянное значение","Контейнер для хранения данных","Тип функции","Оператор сравнения"]`, CorrectIdx: 1},
		{ID: uint(baseID + 2), ModuleID: moduleID, Question: "Какой цикл выполняется, пока условие истинно?", Options: `["for/while","switch","if","struct"]`, CorrectIdx: 0},
		{ID: uint(baseID + 3), ModuleID: moduleID, Question: "Что такое функция?", Options: `["Блок кода для повторного использования","Тип переменной","Ошибка компиляции","Формат файла"]`, CorrectIdx: 0},
		{ID: uint(baseID + 4), ModuleID: moduleID, Question: "Для чего нужны условия if/else?", Options: `["Для ветвления логики","Для хранения данных","Для рисования интерфейса","Для архивирования"]`, CorrectIdx: 0},
		{ID: uint(baseID + 5), ModuleID: moduleID, Question: "Что такое массив?", Options: `["Один символ","Набор элементов одного типа","Сетевая ошибка","Команда терминала"]`, CorrectIdx: 1},
	}
}

func parseOptions(raw string) []string {
	var out []string
	if err := json.Unmarshal([]byte(raw), &out); err == nil && len(out) > 0 {
		return out
	}
	return nil
}
