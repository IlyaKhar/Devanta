package handlers

import (
	"strconv"
	"strings"

	"devanta/backend/internal/models"
	"devanta/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

type FAQHandler struct {
	services *services.Container
}

type faqCategoryDTO struct {
	ID    string       `json:"id"`
	Title string       `json:"title"`
	Icon  string       `json:"icon"`
	Items []faqItemDTO `json:"items"`
}

type faqItemDTO struct {
	ID uint   `json:"id"`
	Q  string `json:"q"`
	A  string `json:"a"`
}

func NewFAQHandler(s *services.Container) *FAQHandler {
	return &FAQHandler{services: s}
}

func (h *FAQHandler) GetFAQ(c *fiber.Ctx) error {
	rows, err := h.services.FAQRepo.ListAll()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot load faq")
	}

	groups := map[string]*faqCategoryDTO{}
	order := make([]string, 0)
	for _, row := range rows {
		key := strings.TrimSpace(row.Category)
		if _, ok := groups[key]; !ok {
			groups[key] = &faqCategoryDTO{
				ID:    key,
				Title: titleByCategory(key),
				Icon:  iconByCategory(key),
				Items: []faqItemDTO{},
			}
			order = append(order, key)
		}
		groups[key].Items = append(groups[key].Items, faqItemDTO{
			ID: row.ID,
			Q:  row.Question,
			A:  row.Answer,
		})
	}

	out := make([]faqCategoryDTO, 0, len(groups))
	for _, key := range order {
		out = append(out, *groups[key])
	}
	return c.JSON(out)
}

func (h *FAQHandler) AdminCreateFAQ(c *fiber.Ctx) error {
	var req struct {
		Category  string `json:"category"`
		Question  string `json:"question"`
		Answer    string `json:"answer"`
		SortOrder int    `json:"sortOrder"`
	}
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid payload")
	}
	if strings.TrimSpace(req.Category) == "" || strings.TrimSpace(req.Question) == "" || strings.TrimSpace(req.Answer) == "" {
		return fiber.NewError(fiber.StatusBadRequest, "category, question and answer are required")
	}

	row := &models.FAQEntry{
		Category:  strings.TrimSpace(req.Category),
		Question:  strings.TrimSpace(req.Question),
		Answer:    strings.TrimSpace(req.Answer),
		SortOrder: req.SortOrder,
	}
	if err := h.services.FAQRepo.Create(row); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot create faq")
	}
	return c.JSON(row)
}

func (h *FAQHandler) AdminUpdateFAQ(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil || id <= 0 {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id")
	}
	var req struct {
		Category  string `json:"category"`
		Question  string `json:"question"`
		Answer    string `json:"answer"`
		SortOrder int    `json:"sortOrder"`
	}
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid payload")
	}
	updates := map[string]interface{}{
		"category":   strings.TrimSpace(req.Category),
		"question":   strings.TrimSpace(req.Question),
		"answer":     strings.TrimSpace(req.Answer),
		"sort_order": req.SortOrder,
	}
	if err := h.services.FAQRepo.UpdateByID(uint(id), updates); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot update faq")
	}
	return c.JSON(fiber.Map{"status": "updated"})
}

func (h *FAQHandler) AdminDeleteFAQ(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil || id <= 0 {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id")
	}
	if err := h.services.FAQRepo.DeleteByID(uint(id)); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot delete faq")
	}
	return c.JSON(fiber.Map{"status": "deleted"})
}

func iconByCategory(category string) string {
	switch category {
	case "general":
		return "💬"
	case "courses":
		return "🎓"
	case "progress":
		return "🏆"
	case "parents":
		return "👨‍👩‍👧"
	case "tech":
		return "🛠️"
	default:
		return "❓"
	}
}

func titleByCategory(category string) string {
	switch category {
	case "general":
		return "Общие вопросы"
	case "courses":
		return "Курсы и обучение"
	case "progress":
		return "Система прогресса"
	case "parents":
		return "Родительский контроль"
	case "tech":
		return "Технические вопросы"
	default:
		return "Другое"
	}
}
