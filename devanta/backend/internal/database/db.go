package database

import (
	"log"
	"os"
	"path/filepath"
	"strconv"

	"gorm.io/gorm/logger"

	"devanta/backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type seedModule struct {
	Title          string
	DurationMonths int
	Students       int
	Rating         float64
	Level          string
}

type seedTask struct {
	ModuleTitle string
	Title       string
	Type        string
	Question    string
	AnswerKey   string
	XPReward    int
}

type seedFAQ struct {
	Category  string
	Question  string
	Answer    string
	SortOrder int
}

var defaultModules = []seedModule{
	{Title: "JavaScript-разработчик", DurationMonths: 9, Students: 12450, Rating: 4.8, Level: "С нуля"},
	{Title: "Python-разработчик", DurationMonths: 10, Students: 15320, Rating: 4.8, Level: "С нуля"},
	{Title: "Golang-разработчик", DurationMonths: 8, Students: 8890, Rating: 4.7, Level: "С нуля"},
	{Title: "Веб-разработчик", DurationMonths: 12, Students: 18760, Rating: 4.8, Level: "С нуля"},
	{Title: "Основы алгоритмов", DurationMonths: 6, Students: 9420, Rating: 4.6, Level: "С нуля"},
	{Title: "Мобильная разработка", DurationMonths: 11, Students: 7230, Rating: 4.7, Level: "С нуля"},
	{Title: "React-разработчик", DurationMonths: 7, Students: 10110, Rating: 4.7, Level: "С нуля"},
	{Title: "Backend-разработчик", DurationMonths: 9, Students: 8650, Rating: 4.6, Level: "С нуля"},
	{Title: "Работа с базами данных", DurationMonths: 5, Students: 6120, Rating: 4.5, Level: "С нуля"},
}

var defaultTasks = []seedTask{
	{ModuleTitle: "JavaScript-разработчик", Title: "Сумма чисел", Type: "basics", Question: "Найди сумму двух чисел.", AnswerKey: "return a+b", XPReward: 50},
	{ModuleTitle: "Python-разработчик", Title: "Реверс строки", Type: "strings", Question: "Переверни строку задом наперед.", AnswerKey: "s[::-1]", XPReward: 75},
	{ModuleTitle: "Веб-разработчик", Title: "Палиндром", Type: "strings", Question: "Проверь, является ли строка палиндромом.", AnswerKey: "normalized==reversed", XPReward: 100},
	{ModuleTitle: "Основы алгоритмов", Title: "Числа Фибоначчи", Type: "algorithms", Question: "Найди N-ое число Фибоначчи.", AnswerKey: "dp/iterative", XPReward: 150},
	{ModuleTitle: "Backend-разработчик", Title: "Сортировка пузырьком", Type: "algorithms", Question: "Реализуй алгоритм сортировки пузырьком.", AnswerKey: "nested loops", XPReward: 200},
	{ModuleTitle: "Golang-разработчик", Title: "Поиск в глубину", Type: "graphs", Question: "Реализуй обход графа в глубину.", AnswerKey: "dfs recursion/stack", XPReward: 300},
}

var defaultFAQ = []seedFAQ{
	{Category: "general", Question: "Что такое Devanta?", Answer: "Devanta — образовательная платформа с уроками и практикой по программированию.", SortOrder: 1},
	{Category: "general", Question: "Для какого возраста подходит платформа?", Answer: "Основная аудитория — школьники 7–15 лет.", SortOrder: 2},
	{Category: "courses", Question: "Какие курсы доступны?", Answer: "JavaScript, Python, Golang, Web, Алгоритмы, Mobile и другие.", SortOrder: 1},
	{Category: "courses", Question: "Сколько времени занимает курс?", Answer: "В среднем 6–12 месяцев в зависимости от темпа ученика.", SortOrder: 2},
	{Category: "progress", Question: "Как работает система XP и уровней?", Answer: "XP начисляется за уроки/задачи/квизы, уровень растет автоматически.", SortOrder: 1},
	{Category: "parents", Question: "Какие данные доступны родителю?", Answer: "Прогресс по модулям, статистика по задачам и динамика обучения.", SortOrder: 1},
	{Category: "tech", Question: "Не открывается урок, что делать?", Answer: "Обнови страницу, проверь интернет и попробуй снова.", SortOrder: 1},
}

func Connect(dsn string) *gorm.DB {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	return db
}

func RunUpMigrations(db *gorm.DB) error {
	if err := db.AutoMigrate(
		&models.User{},
		&models.Module{},
		&models.Lesson{},
		&models.Task{},
		&models.SpecialChallenge{},
		&models.FAQEntry{},
		&models.QuizQuestion{},
		&models.BlockQuizResult{},
		&models.UserProgress{},
		&models.XPEvent{},
		&models.Achievement{},
		&models.UserAchievement{},
		&models.Review{},
		&models.ModerationLog{},
		&models.AILog{},
		&models.ParentConnection{},
	); err != nil {
		return err
	}

	return seedCatalog(db)
}

func RunDownMigrations(db *gorm.DB) error {
	tables := []string{
		"parent_connections", "ai_logs", "moderation_logs", "reviews", "user_achievements", "achievements",
		"xp_events", "user_progresses", "block_quiz_results", "quiz_questions", "faq_entries", "special_challenges", "tasks", "lessons", "modules", "users",
	}
	for _, table := range tables {
		if err := db.Exec("DROP TABLE IF EXISTS " + table + " CASCADE").Error; err != nil {
			return err
		}
	}
	return nil
}

func EnsureMigrationDir(base string) error {
	return os.MkdirAll(filepath.Join(base, "migrations"), 0o755)
}

func seedCatalog(db *gorm.DB) error {
	return db.Transaction(func(tx *gorm.DB) error {
		lessonsByModuleTitle := map[string][]models.Lesson{}
		const blocksCount = 10
		const lessonsPerBlock = 3
		const finalBlockIndex = blocksCount + 1

		for i, item := range defaultModules {
			sortOrder := i + 1
			module := models.Module{
				Title: item.Title,
			}
			if err := tx.Where("title = ?", item.Title).FirstOrCreate(&module).Error; err != nil {
				return err
			}
			if module.SortOrder != sortOrder {
				if err := tx.Model(&module).Update("sort_order", sortOrder).Error; err != nil {
					return err
				}
			}
			if module.DurationMonths != item.DurationMonths || module.Students != item.Students || module.Rating != item.Rating || module.Level != item.Level {
				if err := tx.Model(&module).Updates(map[string]interface{}{
					"duration_months": item.DurationMonths,
					"students":        item.Students,
					"rating":          item.Rating,
					"level":           item.Level,
				}).Error; err != nil {
					return err
				}
			}

			lessonRows := make([]models.Lesson, 0, blocksCount*lessonsPerBlock)
			for block := 1; block <= blocksCount; block++ {
				for l := 1; l <= lessonsPerBlock; l++ {
					globalSort := (block-1)*lessonsPerBlock + l
					lessonTitle := "Блок " + strconv.Itoa(block) + " · Видео " + strconv.Itoa(l)
					videoURL := "https://example.com/video/" + strconv.Itoa(int(module.ID)) + "/" + strconv.Itoa(block) + "/" + strconv.Itoa(l)
					content := "Теория для блока " + strconv.Itoa(block) + ", видео " + strconv.Itoa(l) + ". Здесь появится реальный контент."
					lesson := models.Lesson{
						ModuleID: module.ID,
						Title:    lessonTitle,
						Content:  content,
						VideoURL: videoURL,
					}
					if err := tx.Where("module_id = ? AND sort_order = ?", module.ID, globalSort).FirstOrCreate(&lesson).Error; err != nil {
						return err
					}
					if lesson.Title != lessonTitle || lesson.Content != content || lesson.VideoURL != videoURL || lesson.SortOrder != globalSort {
						if err := tx.Model(&lesson).Updates(map[string]interface{}{
							"title":      lessonTitle,
							"content":    content,
							"video_url":  videoURL,
							"sort_order": globalSort,
						}).Error; err != nil {
							return err
						}
					}
					lessonRows = append(lessonRows, lesson)
				}
			}
			// Финальный блок 11: итоговое занятие (один урок).
			finalSort := blocksCount*lessonsPerBlock + 1
			finalTitle := "Итоговое занятие"
			finalVideoURL := "https://example.com/video/" + strconv.Itoa(int(module.ID)) + "/final"
			finalContent := "Итоговая теория и подготовка к финальному тесту."
			finalLesson := models.Lesson{
				ModuleID: module.ID,
				Title:    finalTitle,
				Content:  finalContent,
				VideoURL: finalVideoURL,
			}
			if err := tx.Where("module_id = ? AND sort_order = ?", module.ID, finalSort).FirstOrCreate(&finalLesson).Error; err != nil {
				return err
			}
			if finalLesson.Title != finalTitle || finalLesson.Content != finalContent || finalLesson.VideoURL != finalVideoURL || finalLesson.SortOrder != finalSort {
				if err := tx.Model(&finalLesson).Updates(map[string]interface{}{
					"title":      finalTitle,
					"content":    finalContent,
					"video_url":  finalVideoURL,
					"sort_order": finalSort,
				}).Error; err != nil {
					return err
				}
			}
			lessonRows = append(lessonRows, finalLesson)
			lessonsByModuleTitle[item.Title] = lessonRows
		}

		// Одна задачка на блок (привязываем к первому уроку блока).
		for _, lessonRows := range lessonsByModuleTitle {
			for block := 1; block <= blocksCount; block++ {
				firstIdx := (block - 1) * lessonsPerBlock
				if firstIdx < 0 || firstIdx >= len(lessonRows) {
					continue
				}
				firstLesson := lessonRows[firstIdx]
				taskTitle := "Задача блока " + strconv.Itoa(block)
				task := models.Task{
					LessonID:  firstLesson.ID,
					Title:     taskTitle,
					Type:      "basics",
					Question:  "Напиши решение задачи для блока " + strconv.Itoa(block) + ".",
					AnswerKey: "demo",
					XPReward:  60 + block*15,
				}
				if err := tx.Where("lesson_id = ? AND title = ?", firstLesson.ID, taskTitle).FirstOrCreate(&task).Error; err != nil {
					return err
				}
			}
			// Финальная задачка (привязываем к финальному уроку).
			finalSort := blocksCount*lessonsPerBlock + 1
			for _, lesson := range lessonRows {
				if lesson.SortOrder != finalSort {
					continue
				}
				taskTitle := "Финальная задача"
				task := models.Task{
					LessonID:  lesson.ID,
					Title:     taskTitle,
					Type:      "basics",
					Question:  "Финальная задача по модулю. Собери всё вместе.",
					AnswerKey: "demo",
					XPReward:  300,
				}
				if err := tx.Where("lesson_id = ? AND title = ?", lesson.ID, taskTitle).FirstOrCreate(&task).Error; err != nil {
					return err
				}
			}
		}

		specialSeeds := []models.SpecialChallenge{
			{
				Code:        "daily-even",
				Title:       "Ежедневная задача: Четные числа",
				Description: "Выведи все четные числа от 1 до 100",
				RewardXP:    100,
				Duration:    "12 часов",
				SortOrder:   1,
			},
			{
				Code:        "weekly-calc",
				Title:       "Недельный вызов: Калькулятор",
				Description: "Создай калькулятор с базовыми операциями",
				RewardXP:    500,
				Duration:    "4 дня",
				SortOrder:   2,
			},
		}
		for _, ch := range specialSeeds {
			row := ch
			if err := tx.Where("code = ?", row.Code).FirstOrCreate(&row).Error; err != nil {
				return err
			}
			if row.Title != ch.Title || row.Description != ch.Description || row.RewardXP != ch.RewardXP || row.Duration != ch.Duration || row.SortOrder != ch.SortOrder {
				if err := tx.Model(&row).Updates(map[string]interface{}{
					"title": ch.Title, "description": ch.Description, "reward_xp": ch.RewardXP,
					"duration": ch.Duration, "sort_order": ch.SortOrder,
				}).Error; err != nil {
					return err
				}
			}
		}
		for _, item := range defaultFAQ {
			row := models.FAQEntry{
				Category:  item.Category,
				Question:  item.Question,
				Answer:    item.Answer,
				SortOrder: item.SortOrder,
			}
			if err := tx.Where("category = ? AND question = ?", row.Category, row.Question).FirstOrCreate(&row).Error; err != nil {
				return err
			}
			if row.Answer != item.Answer || row.SortOrder != item.SortOrder {
				if err := tx.Model(&row).Updates(map[string]interface{}{
					"answer": item.Answer, "sort_order": item.SortOrder,
				}).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})
}
