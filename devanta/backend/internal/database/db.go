package database

import (
	"errors"
	"log"
	"os"
	"path/filepath"
	"time"

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

type seedFAQ struct {
	Category  string
	Question  string
	Answer    string
	SortOrder int
}

// Три активных демо-курса: полный контент в seed_democontent.go + сид квизов по блокам.
var defaultModules = []seedModule{
	{Title: "JavaScript-разработчик", DurationMonths: 9, Students: 12450, Rating: 4.8, Level: "С нуля"},
	{Title: "Python-разработчик", DurationMonths: 10, Students: 15320, Rating: 4.8, Level: "С нуля"},
	{Title: "Веб-разработчик", DurationMonths: 12, Students: 18760, Rating: 4.8, Level: "С нуля"},
}

var defaultFAQ = []seedFAQ{
	{Category: "general", Question: "Что такое Devanta?", Answer: "Devanta - образовательная платформа с уроками и практикой по программированию.", SortOrder: 1},
	{Category: "general", Question: "Для какого возраста подходит платформа?", Answer: "Основная аудитория - школьники 7–15 лет.", SortOrder: 2},
	{Category: "courses", Question: "Какие курсы доступны?", Answer: "JavaScript, Python, Golang, Web, Алгоритмы, Mobile и другие.", SortOrder: 1},
	{Category: "courses", Question: "Сколько времени занимает курс?", Answer: "В среднем 6–12 месяцев в зависимости от темпа ученика.", SortOrder: 2},
	{Category: "progress", Question: "Как работает система XP и уровней?", Answer: "XP начисляется за уроки/задачи/квизы, уровень растет автоматически.", SortOrder: 1},
	{Category: "parents", Question: "Какие данные доступны родителю?", Answer: "Прогресс по модулям, статистика по задачам и динамика обучения.", SortOrder: 1},
	{Category: "tech", Question: "Не открывается урок, что делать?", Answer: "Обнови страницу, проверь интернет и попробуй снова.", SortOrder: 1},
}

func Connect(dsn string) *gorm.DB {
	// Не спамим логами при ожидаемом «пользователь не найден» на логине и т.п.
	gormLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  logger.Warn,
			IgnoreRecordNotFoundError: true,
			Colorful:                  false,
		},
	)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormLogger,
	})
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	if err := ensureUsersTelegramIDNullable(db); err != nil {
		log.Fatalf("schema fix users.telegram_id: %v", err)
	}
	return db
}

// EnsureUserSchema — подтягивает колонки users (avatar_url и др.) без полного migrate+seed.
func EnsureUserSchema(db *gorm.DB) error {
	return db.AutoMigrate(&models.User{}, &models.UserChallengeClaim{})
}

// prepareParentConnectionSchema — старый parent_contact → дроп таблицы; новая схема через AutoMigrate.
func prepareParentConnectionSchema(db *gorm.DB) error {
	var n int64
	if err := db.Raw(`
		SELECT COUNT(*) FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'parent_connections' AND column_name = 'parent_contact'
	`).Scan(&n).Error; err != nil {
		return err
	}
	if n > 0 {
		return db.Exec(`DROP TABLE IF EXISTS parent_connections CASCADE`).Error
	}
	return nil
}

// EnsureParentConnectionSchema — для cmd/server без полного migrate up.
func EnsureParentConnectionSchema(db *gorm.DB) error {
	if err := prepareParentConnectionSchema(db); err != nil {
		return err
	}
	return db.AutoMigrate(&models.ParentConnection{})
}

// EnsureTaskSchema — колонки starter_code, hints_json, checks_json для задач с кодом.
func EnsureTaskSchema(db *gorm.DB) error {
	return db.AutoMigrate(&models.Task{})
}

// EnsureQuizQuestionSchema — block_index у вопросов квиза (после обновления без полного migrate).
func EnsureQuizQuestionSchema(db *gorm.DB) error {
	return db.AutoMigrate(&models.QuizQuestion{})
}

// EnsureBlockQuizResultSchema — lesson_in_block + новый unique; снимаем старый индекс без слота урока.
func EnsureBlockQuizResultSchema(db *gorm.DB) error {
	_ = db.Exec(`DROP INDEX IF EXISTS idx_block_quiz_unique`).Error
	return db.AutoMigrate(&models.BlockQuizResult{})
}

func RunUpMigrations(db *gorm.DB) error {
	if err := prepareParentConnectionSchema(db); err != nil {
		return err
	}
	if err := db.AutoMigrate(
		&models.User{},
		&models.UserChallengeClaim{},
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

func ensureUsersTelegramIDNullable(db *gorm.DB) error {
	return db.Exec(`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'telegram_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE users ALTER COLUMN telegram_id DROP NOT NULL;
  END IF;
END $$;
`).Error
}

func RunDownMigrations(db *gorm.DB) error {
	tables := []string{
		"parent_connections", "user_challenge_claims", "ai_logs", "moderation_logs", "reviews", "user_achievements", "achievements",
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
		activeTitles := []string{"JavaScript-разработчик", "Python-разработчик", "Веб-разработчик"}
		if err := tx.Where("title NOT IN ?", activeTitles).Delete(&models.Module{}).Error; err != nil {
			return err
		}

		lessonsByModuleTitle := map[string][]models.Lesson{}
		const blocksCount = 10
		const lessonsPerBlock = 3

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
					lessonTitle, videoURL, content := DemoLessonContent(item.Title, globalSort)
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
			finalTitle, finalVideoURL, finalContent := DemoLessonContent(item.Title, finalSort)
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

			// Пересобираем вопросы квиза: у каждого блока свой набор (block_index).
			if err := tx.Where("module_id = ?", module.ID).Delete(&models.QuizQuestion{}).Error; err != nil {
				return err
			}
			for _, qq := range BuildDemoQuizQuestions(module.ID, item.Title) {
				row := qq
				if err := tx.Create(&row).Error; err != nil {
					return err
				}
			}
		}

		// По одной задаче с кодом на каждый урок (включая финал).
		for moduleTitle, lessonRows := range lessonsByModuleTitle {
			for _, lesson := range lessonRows {
				spec := DemoCodeTaskForLesson(moduleTitle, lesson.SortOrder)
				if err := tx.Where("lesson_id = ?", lesson.ID).Delete(&models.Task{}).Error; err != nil {
					return err
				}
				task := models.Task{
					LessonID:    lesson.ID,
					Title:       spec.Title,
					Type:        "code",
					Question:    spec.Question,
					AnswerKey:   "auto",
					Language:    "javascript",
					StarterCode: spec.StarterCode,
					HintsJSON:   spec.HintsJSON,
					ChecksJSON:  spec.ChecksJSON,
					XPReward:    spec.XPReward,
				}
				if err := tx.Create(&task).Error; err != nil {
					return err
				}
			}
		}

		for _, seed := range DemoAchievementSeeds() {
			var existing models.Achievement
			err := tx.Where("code = ?", seed.Code).First(&existing).Error
			if err != nil {
				if !errors.Is(err, gorm.ErrRecordNotFound) {
					return err
				}
				if err := tx.Create(&models.Achievement{Code: seed.Code, Title: seed.Title}).Error; err != nil {
					return err
				}
				continue
			}
			if existing.Title != seed.Title {
				if err := tx.Model(&existing).Update("title", seed.Title).Error; err != nil {
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
