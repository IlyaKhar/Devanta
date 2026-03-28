package handlers

import (
	"encoding/json"
	"errors"
	"strconv"
	"strings"
	"time"

	"devanta/backend/internal/models"
	"devanta/backend/internal/services"
	"devanta/backend/internal/services/codecheck"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
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
	RewardCoins int    `json:"rewardCoins"` // монеты за первое успешное решение
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
	RewardCoins int    `json:"rewardCoins"`
	Duration    string `json:"duration"`
	Completed   bool   `json:"completed"`
}

type moduleCourseLessonDTO struct {
	ID          uint   `json:"id"`
	Title       string `json:"title"`
	SortOrder   int    `json:"sortOrder"`
	LessonSlot  int    `json:"lessonInBlock"` // 1..3 в обычном блоке; у итога — 1
	Duration    string `json:"duration"`
	Completed   bool   `json:"completed"`
	QuizPassed  bool   `json:"quizPassed"`
	Status      string `json:"status"`
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

// coinsForTaskXP — бонус-монеты за задачу (первое решение).
func coinsForTaskXP(xp int) int {
	n := xp / 12
	if n < 3 {
		n = 3
	}
	if n > 80 {
		n = 80
	}
	return n
}

// coinsForChallengeXP — монеты за спецчеллендж.
func coinsForChallengeXP(xp int) int {
	n := 12 + xp/8
	if n < 18 {
		n = 18
	}
	if n > 500 {
		n = 500
	}
	return n
}

// Все три теста уроков предыдущего блока сданы — открываем следующий блок.
func previousBlockAllLessonQuizzesPassed(slot map[int]map[int]bool, prevBlock int) bool {
	if prevBlock < 1 {
		return true
	}
	m := slot[prevBlock]
	if m == nil {
		return false
	}
	return m[1] && m[2] && m[3]
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
	userID, _ := c.Locals("userID").(uint)
	return c.JSON(taskStudentResponse(h.services, task, userID))
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
	// У каждого урока своя задача (раньше брали только первый урок блока).
	task, taskErr := h.services.TaskRepo.GetFirstByLessonID(lesson.ID)
	if taskErr != nil {
		return fiber.NewError(fiber.StatusNotFound, "task not found")
	}
	userID, _ := c.Locals("userID").(uint)
	return c.JSON(taskStudentResponse(h.services, task, userID))
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
	slotMap := map[int]map[int]bool{}
	if userID > 0 {
		statusMap, _ = h.services.LessonRepo.StatusesByUserAndModule(userID, module.ID)
		slotMap, _ = h.services.BlockQuizResultRepo.PassedSlotMap(userID, module.ID)
	}
	if slotMap == nil {
		slotMap = map[int]map[int]bool{}
	}

	progressPoints := 0
	totalXP := 0
	lessonItems := make([]moduleCourseLessonDTO, 0, len(lessons))
	const lessonsPerBlock = 3
	for _, lesson := range lessons {
		blockIndex := (lesson.SortOrder-1)/lessonsPerBlock + 1
		lessonInBlock := (lesson.SortOrder-1)%lessonsPerBlock + 1
		isUnlocked := previousBlockAllLessonQuizzesPassed(slotMap, blockIndex-1)
		status := statusMap[lesson.ID]
		if status == "" {
			status = "not_started"
		}
		quizPassed := false
		if sm := slotMap[blockIndex]; sm != nil {
			quizPassed = sm[lessonInBlock]
		}
		done := status == "completed"
		if !isUnlocked {
			status = "locked"
		}
		// Прогресс: урок + отдельный вклад за тест этого урока (слот внутри блока).
		if isUnlocked {
			if done {
				progressPoints += 100
			} else if quizPassed {
				progressPoints += 70
			} else if status == "in_progress" {
				progressPoints += 50
			}
		}
		lessonItems = append(lessonItems, moduleCourseLessonDTO{
			ID:         lesson.ID,
			Title:      lesson.Title,
			SortOrder:  lesson.SortOrder,
			LessonSlot: lessonInBlock,
			Duration:   estimateLessonDuration(lesson.SortOrder),
			Completed:  done,
			QuizPassed: quizPassed,
			Status:     status,
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
	userID, _ := c.Locals("userID").(uint)
	rows, err := h.services.SpecialChallengeRepo.ListAll()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "cannot load special challenges")
	}
	out := make([]specialChallengeDTO, 0, len(rows))
	for _, row := range rows {
		done := false
		if userID > 0 {
			done, _ = h.services.SpecialChallengeRepo.IsClaimed(userID, row.Code)
		}
		out = append(out, specialChallengeDTO{
			ID:          row.Code,
			Title:       row.Title,
			Description: row.Description,
			RewardXP:    row.RewardXP,
			RewardCoins: coinsForChallengeXP(row.RewardXP),
			Duration:    row.Duration,
			Completed:   done,
		})
	}
	return c.JSON(out)
}

// ClaimSpecialChallenge — один раз: XP + монеты (демо: без проверки кода, награда по кнопке).
func (h *LearningHandler) ClaimSpecialChallenge(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok || userID == 0 {
		return fiber.NewError(fiber.StatusUnauthorized, "missing token")
	}
	code := strings.TrimSpace(c.Params("code"))
	if code == "" {
		return fiber.NewError(fiber.StatusBadRequest, "invalid code")
	}
	if claimed, _ := h.services.SpecialChallengeRepo.IsClaimed(userID, code); claimed {
		u, _ := h.services.UserRepo.GetByID(userID)
		bal := 0
		if u != nil {
			bal = u.Coins
		}
		return c.JSON(fiber.Map{
			"ok": true, "already": true, "coinsEarned": 0, "coinsBalance": bal,
		})
	}
	ch, err := h.services.SpecialChallengeRepo.GetByCode(code)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "challenge not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "cannot load challenge")
	}
	if err := h.services.SpecialChallengeRepo.CreateClaim(userID, code); err != nil {
		if claimed, _ := h.services.SpecialChallengeRepo.IsClaimed(userID, code); claimed {
			u, _ := h.services.UserRepo.GetByID(userID)
			bal := 0
			if u != nil {
				bal = u.Coins
			}
			return c.JSON(fiber.Map{
				"ok": true, "already": true, "coinsEarned": 0, "coinsBalance": bal,
			})
		}
		return fiber.NewError(fiber.StatusInternalServerError, "cannot claim")
	}
	coins := coinsForChallengeXP(ch.RewardXP)
	_ = h.services.Gamification.AddXP(userID, "challenge_complete", ch.RewardXP)
	_ = h.services.UserRepo.AddCoins(userID, coins)
	u, _ := h.services.UserRepo.GetByID(userID)
	bal := 0
	if u != nil {
		bal = u.Coins
	}
	return c.JSON(fiber.Map{
		"ok": true, "already": false, "xp": ch.RewardXP, "coinsEarned": coins, "coinsBalance": bal,
	})
}

func (h *LearningHandler) GetTasks(c *fiber.Ctx) error {
	difficulty := strings.ToLower(c.Query("difficulty", "all"))
	if difficulty != "all" && difficulty != "easy" && difficulty != "medium" && difficulty != "hard" {
		return fiber.NewError(fiber.StatusBadRequest, "difficulty must be all|easy|medium|hard")
	}
	scope := strings.ToLower(strings.TrimSpace(c.Query("scope", "open")))
	if scope != "open" && scope != "done" && scope != "all" {
		return fiber.NewError(fiber.StatusBadRequest, "scope must be open|done|all")
	}

	userID, ok := c.Locals("userID").(uint)
	if !ok || userID == 0 {
		return fiber.NewError(fiber.StatusUnauthorized, "missing token")
	}

	completedLessons, _ := h.services.LessonRepo.CompletedLessonIDsForUser(userID)
	if completedLessons == nil {
		completedLessons = map[uint]struct{}{}
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
		_, done := completedLessons[task.LessonID]
		switch scope {
		case "open":
			if done {
				continue
			}
		case "done":
			if !done {
				continue
			}
		}

		items = append(items, taskDTO{
			ID:          task.ID,
			Title:       task.Title,
			Description: task.Question,
			Category:    mapCategory(task.Type),
			XP:          task.XPReward,
			RewardCoins: coinsForTaskXP(task.XPReward),
			Time:        mapTime(task.XPReward),
			Solves:      mapSolves(task.ID),
			Difficulty:  diffLabel,
			Completed:   done,
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

	checks, parseErr := codecheck.ParseAssertionsJSON(task.ChecksJSON)
	if parseErr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "invalid task checks config")
	}
	if len(checks) > 0 {
		var req struct {
			Code string `json:"code"`
		}
		if err := c.BodyParser(&req); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, `нужен JSON {"code":"..."}`)
		}
		if err := codecheck.ValidateJavaScript(strings.TrimSpace(req.Code), checks, 4*time.Second); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"accepted": false,
				"message":  err.Error(),
			})
		}
	}

	wasCompleted, _ := h.services.LessonRepo.IsLessonCompleted(userID, task.LessonID)
	coinsEarned := 0
	if !wasCompleted {
		coinsEarned = coinsForTaskXP(task.XPReward)
		_ = h.services.Gamification.AddXP(userID, "task_complete", task.XPReward)
		_ = h.services.UserRepo.AddCoins(userID, coinsEarned)
	}

	// Ачивки не привязываем только к «первому закрытию урока»: иначе после demo-complete / course-smoke сабмит не выдавал бы награды.
	_ = h.services.UserRepo.TryGrantAchievement(userID, "code_warrior")

	_ = h.services.LessonRepo.UpsertUserProgress(userID, task.LessonID, "completed", 100)

	doneWithTasks, _ := h.services.LessonRepo.CountCompletedLessonsWithTask(userID)
	if doneWithTasks >= 10 {
		_ = h.services.UserRepo.TryGrantAchievement(userID, "task_marathon")
	}
	if task.Title == "Финальная задача" {
		lesson, lerr := h.services.LessonRepo.GetByID(task.LessonID)
		if lerr == nil {
			mod, merr := h.services.ModuleRepo.GetByID(lesson.ModuleID)
			if merr == nil {
				switch {
				case strings.Contains(mod.Title, "JavaScript"):
					_ = h.services.UserRepo.TryGrantAchievement(userID, "grad_js")
				case strings.Contains(mod.Title, "Python"):
					_ = h.services.UserRepo.TryGrantAchievement(userID, "grad_py")
				case strings.Contains(mod.Title, "Веб"):
					_ = h.services.UserRepo.TryGrantAchievement(userID, "grad_web")
				}
			}
		}
	}

	u, _ := h.services.UserRepo.GetByID(userID)
	bal := 0
	if u != nil {
		bal = u.Coins
	}
	return c.JSON(fiber.Map{
		"accepted":      true,
		"taskId":        taskID,
		"status":        "accepted",
		"xp":            task.XPReward,
		"xpGranted":     !wasCompleted,
		"coinsEarned":   coinsEarned,
		"coinsBalance":  bal,
		"firstSolve":    !wasCompleted,
	})
}

func taskStudentResponse(svc *services.Container, task *models.Task, userID uint) fiber.Map {
	m := taskStudentJSON(task)
	m["coinsOnFirstSolve"] = coinsForTaskXP(task.XPReward)
	if userID > 0 {
		done, _ := svc.LessonRepo.IsLessonCompleted(userID, task.LessonID)
		m["lessonCompleted"] = done
	} else {
		m["lessonCompleted"] = false
	}
	return m
}

// taskStudentJSON — ответ GET задачи: без checks_json и answer_key.
func taskStudentJSON(task *models.Task) fiber.Map {
	lang := strings.TrimSpace(task.Language)
	if lang == "" {
		lang = "javascript"
	}
	var hints []string
	if strings.TrimSpace(task.HintsJSON) != "" {
		_ = json.Unmarshal([]byte(task.HintsJSON), &hints)
	}
	checks, _ := codecheck.ParseAssertionsJSON(task.ChecksJSON)
	return fiber.Map{
		"id":              task.ID,
		"lessonId":        task.LessonID,
		"title":           task.Title,
		"type":            task.Type,
		"question":        task.Question,
		"xpReward":        task.XPReward,
		"language":        lang,
		"starterCode":     task.StarterCode,
		"hints":           hints,
		"needsCodeCheck": len(checks) > 0,
	}
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
