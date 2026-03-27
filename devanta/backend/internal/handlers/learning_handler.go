package handlers

import (
	"strconv"
	"strings"

	"devanta/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

type LearningHandler struct {
	services *services.Container
}

type taskDTO struct {
	ID          uint   `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Category    string `json:"category"`
	XP          int    `json:"xp"`
	Time        string `json:"time"`
	Solves      int    `json:"solves"`
	Difficulty  string `json:"difficulty"`
	Completed   bool   `json:"completed"`
}

type specialChallengeDTO struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	RewardXP    int    `json:"rewardXp"`
	Duration    string `json:"duration"`
}

type moduleCourseLessonDTO struct {
	ID        uint   `json:"id"`
	Title     string `json:"title"`
	Duration  string `json:"duration"`
	Completed bool   `json:"completed"`
	Status    string `json:"status"`
}

type moduleCourseDTO struct {
	ID          uint                    `json:"id"`
	Title       string                  `json:"title"`
	Description string                  `json:"description"`
	Duration    string                  `json:"duration"`
	Students    int                     `json:"students"`
	Rating      float64                 `json:"rating"`
	Level       string                  `json:"level"`
	Progress    int                     `json:"progress"`
	TotalXP     int                     `json:"totalXp"`
	Lessons     []moduleCourseLessonDTO `json:"lessons"`
}

func NewLearningHandler(s *services.Container) *LearningHandler {
	return &LearningHandler{services: s}
}

func (h *LearningHandler) GetModules(c *fiber.Ctx) error {
	tab := strings.ToLower(c.Query("tab", "all"))

	switch tab {
	case "all":
		modules, err := h.services.ModuleRepo.ListAll()
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "cannot load modules")
		}
		return c.JSON(modules)
	case "active":
		userID, ok := c.Locals("userID").(uint)
		if !ok || userID == 0 {
			return fiber.NewError(fiber.StatusUnauthorized, "missing token")
		}
		modules, err := h.services.ModuleRepo.ListActiveByUser(userID)
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "cannot load active modules")
		}
		return c.JSON(modules)
	default:
		return fiber.NewError(fiber.StatusBadRequest, "tab must be all or active")
	}
}

func (h *LearningHandler) GetLessons(c *fiber.Ctx) error {
	moduleID, err := strconv.Atoi(c.Params("id"))
	if err != nil || moduleID <= 0 {
		return fiber.NewError(fiber.StatusBadRequest, "invalid module id")
	}

	lessons, repoErr := h.services.LessonRepo.ListByModuleID(uint(moduleID))
	if repoErr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot load lessons")
	}

	return c.JSON(fiber.Map{"moduleId": moduleID, "lessons": lessons})
}

func (h *LearningHandler) GetLesson(c *fiber.Ctx) error {
	lessonID, err := strconv.Atoi(c.Params("id"))
	if err != nil || lessonID <= 0 {
		return fiber.NewError(fiber.StatusBadRequest, "invalid lesson id")
	}
	lesson, repoErr := h.services.LessonRepo.GetByID(uint(lessonID))
	if repoErr != nil {
		return fiber.NewError(fiber.StatusNotFound, "lesson not found")
	}
	if userID, ok := c.Locals("userID").(uint); ok && userID > 0 {
		_ = h.services.LessonRepo.UpsertUserProgress(userID, lesson.ID, "in_progress", 0)
	}
	return c.JSON(lesson)
}

func (h *LearningHandler) GetTask(c *fiber.Ctx) error {
	taskID, err := strconv.Atoi(c.Params("id"))
	if err != nil || taskID <= 0 {
		return fiber.NewError(fiber.StatusBadRequest, "invalid task id")
	}
	task, repoErr := h.services.TaskRepo.GetByID(uint(taskID))
	if repoErr != nil {
		return fiber.NewError(fiber.StatusNotFound, "task not found")
	}
	return c.JSON(fiber.Map{
		"id":       task.ID,
		"lessonId": task.LessonID,
		"title":    task.Title,
		"type":     task.Type,
		"question": task.Question,
		"xpReward": task.XPReward,
	})
}

func (h *LearningHandler) GetTaskByLesson(c *fiber.Ctx) error {
	lessonID, err := strconv.Atoi(c.Params("id"))
	if err != nil || lessonID <= 0 {
		return fiber.NewError(fiber.StatusBadRequest, "invalid lesson id")
	}
	lesson, repoErr := h.services.LessonRepo.GetByID(uint(lessonID))
	if repoErr != nil {
		return fiber.NewError(fiber.StatusNotFound, "lesson not found")
	}
	const lessonsPerBlock = 3
	blockIndex := (lesson.SortOrder-1)/lessonsPerBlock + 1
	firstSort := (blockIndex-1)*lessonsPerBlock + 1
	firstLesson, firstErr := h.services.LessonRepo.GetByModuleIDAndSortOrder(lesson.ModuleID, firstSort)
	if firstErr != nil {
		return fiber.NewError(fiber.StatusNotFound, "task not found")
	}
	task, taskErr := h.services.TaskRepo.GetFirstByLessonID(firstLesson.ID)
	if taskErr != nil {
		return fiber.NewError(fiber.StatusNotFound, "task not found")
	}
	return c.JSON(fiber.Map{
		"id":       task.ID,
		"lessonId": task.LessonID,
		"title":    task.Title,
		"type":     task.Type,
		"question": task.Question,
		"xpReward": task.XPReward,
	})
}

func (h *LearningHandler) GetModuleCourse(c *fiber.Ctx) error {
	moduleID, err := strconv.Atoi(c.Params("id"))
	if err != nil || moduleID <= 0 {
		return fiber.NewError(fiber.StatusBadRequest, "invalid module id")
	}

	module, moduleErr := h.services.ModuleRepo.GetByID(uint(moduleID))
	if moduleErr != nil {
		return fiber.NewError(fiber.StatusNotFound, "module not found")
	}
	lessons, lessonsErr := h.services.LessonRepo.ListByModuleID(module.ID)
	if lessonsErr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot load lessons")
	}

	userID, _ := c.Locals("userID").(uint)
	statusMap := map[uint]string{}
	passedBlockMap := map[int]bool{}
	if userID > 0 {
		statusMap, _ = h.services.LessonRepo.StatusesByUserAndModule(userID, module.ID)
		passedBlockMap, _ = h.services.BlockQuizResultRepo.PassedMap(userID, module.ID)
	}

	progressPoints := 0
	totalXP := 0
	lessonItems := make([]moduleCourseLessonDTO, 0, len(lessons))
	const lessonsPerBlock = 3
	for _, lesson := range lessons {
		blockIndex := (lesson.SortOrder-1)/lessonsPerBlock + 1
		isUnlocked := blockIndex == 1 || passedBlockMap[blockIndex-1]
		status := statusMap[lesson.ID]
		if status == "" {
			status = "not_started"
		}
		if !isUnlocked {
			status = "locked"
		}
		done := status == "completed"
		if status == "completed" {
			progressPoints += 100
		} else if status == "in_progress" {
			progressPoints += 50
		}
		lessonItems = append(lessonItems, moduleCourseLessonDTO{
			ID:        lesson.ID,
			Title:     lesson.Title,
			Duration:  estimateLessonDuration(lesson.SortOrder),
			Completed: done,
			Status:    status,
		})
		totalXP += 50
	}

	progress := 0
	if len(lessons) > 0 {
		progress = progressPoints / len(lessons)
	}

	out := moduleCourseDTO{
		ID:          module.ID,
		Title:       module.Title,
		Description: "Практический модуль с уроками и задачами.",
		Duration:    durationLabel(module.DurationMonths, len(lessons)),
		Students:    defaultPositiveInt(module.Students, 0),
		Rating:      maxFloat(module.Rating, 4.8),
		Level:       defaultStr(module.Level, "С нуля"),
		Progress:    progress,
		TotalXP:     totalXP,
		Lessons:     lessonItems,
	}
	return c.JSON(out)
}

func (h *LearningHandler) GetSpecialChallenges(c *fiber.Ctx) error {
	rows, err := h.services.SpecialChallengeRepo.ListAll()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot load special challenges")
	}
	out := make([]specialChallengeDTO, 0, len(rows))
	for _, row := range rows {
		out = append(out, specialChallengeDTO{
			ID:          row.Code,
			Title:       row.Title,
			Description: row.Description,
			RewardXP:    row.RewardXP,
			Duration:    row.Duration,
		})
	}
	return c.JSON(out)
}

func (h *LearningHandler) GetTasks(c *fiber.Ctx) error {
	difficulty := strings.ToLower(c.Query("difficulty", "all"))
	if difficulty != "all" && difficulty != "easy" && difficulty != "medium" && difficulty != "hard" {
		return fiber.NewError(fiber.StatusBadRequest, "difficulty must be all|easy|medium|hard")
	}

	dbTasks, err := h.services.TaskRepo.ListAll()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot load tasks")
	}

	items := make([]taskDTO, 0, len(dbTasks))
	for _, task := range dbTasks {
		diffCode, diffLabel := mapDifficulty(task.XPReward)
		if difficulty != "all" && difficulty != diffCode {
			continue
		}

		items = append(items, taskDTO{
			ID:          task.ID,
			Title:       task.Title,
			Description: task.Question,
			Category:    mapCategory(task.Type),
			XP:          task.XPReward,
			Time:        mapTime(task.XPReward),
			Solves:      mapSolves(task.ID),
			Difficulty:  diffLabel,
			Completed:   false,
		})
	}

	return c.JSON(items)
}

func (h *LearningHandler) SubmitTask(c *fiber.Ctx) error {
	taskID, err := strconv.Atoi(c.Params("id"))
	if err != nil || taskID <= 0 {
		return fiber.NewError(fiber.StatusBadRequest, "invalid task id")
	}
	userID, ok := c.Locals("userID").(uint)
	if !ok || userID == 0 {
		return fiber.NewError(fiber.StatusUnauthorized, "missing token")
	}

	task, repoErr := h.services.TaskRepo.GetByID(uint(taskID))
	if repoErr != nil {
		return fiber.NewError(fiber.StatusNotFound, "task not found")
	}

	_ = h.services.Gamification.AddXP(userID, "task_complete", task.XPReward)
	_ = h.services.LessonRepo.UpsertUserProgress(userID, task.LessonID, "completed", 100)

	return c.JSON(fiber.Map{"taskId": taskID, "status": "accepted", "xp": task.XPReward})
}

func mapDifficulty(xp int) (string, string) {
	if xp <= 80 {
		return "easy", "Легко"
	}
	if xp <= 160 {
		return "medium", "Средне"
	}
	return "hard", "Сложно"
}

func mapCategory(taskType string) string {
	switch strings.ToLower(taskType) {
	case "algorithms":
		return "Алгоритмы"
	case "strings":
		return "Строки"
	case "graphs":
		return "Графы"
	default:
		return "Основы"
	}
}

func mapTime(xp int) string {
	if xp <= 80 {
		return "5-10 мин"
	}
	if xp <= 160 {
		return "15-20 мин"
	}
	return "30-45 мин"
}

func mapSolves(taskID uint) int {
	return 1500 - int(taskID)*97
}

func estimateLessonDuration(sortOrder int) string {
	base := 10 + sortOrder*2
	return strconv.Itoa(base) + " мин"
}

func estimateModuleDuration(lessons int) string {
	if lessons <= 0 {
		return "1 месяц"
	}
	months := lessons/4 + 1
	return strconv.Itoa(months) + " месяцев"
}

func durationLabel(months int, lessons int) string {
	if months > 0 {
		if months == 1 {
			return "1 месяц"
		}
		return strconv.Itoa(months) + " месяцев"
	}
	return estimateModuleDuration(lessons)
}

func defaultStr(v string, fallback string) string {
	if strings.TrimSpace(v) == "" {
		return fallback
	}
	return strings.TrimSpace(v)
}

func defaultPositiveInt(v int, fallback int) int {
	if v <= 0 {
		return fallback
	}
	return v
}

func maxFloat(v float64, fallback float64) float64 {
	if v <= 0 {
		return fallback
	}
	return v
}
