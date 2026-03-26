package services

import (
	"fmt"
)

type AIService struct {
	apiKey string
}

func NewAIService(apiKey string) *AIService {
	return &AIService{apiKey: apiKey}
}

func (s *AIService) Explain(lesson, age string) string {
	if s.apiKey == "" {
		return "Max: пока API недоступен, но я могу объяснить тему простыми шагами."
	}
	return fmt.Sprintf("Max: объясняю тему '%s' для возраста %s коротко и понятно.", lesson, age)
}

func (s *AIService) Hint(task, answer string) string {
	if answer == "" {
		return "Max: сначала выдели входные данные и что должно получиться на выходе."
	}
	return "Max: хорошая попытка, проверь условие и граничные случаи."
}

func (s *AIService) Check(task, answer string) string {
	if answer == "" {
		return "Max: решения нет. Попробуй написать базовый алгоритм шаг за шагом."
	}
	return "Max: решение принято на проверку. Начни с валидации и разбиения на функции."
}
