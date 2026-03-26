package database

import (
	"log"
	"os"
	"path/filepath"

	"gorm.io/gorm/logger"

	"devanta/backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

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
	return db.AutoMigrate(
		&models.User{},
		&models.Module{},
		&models.Lesson{},
		&models.Task{},
		&models.QuizQuestion{},
		&models.UserProgress{},
		&models.XPEvent{},
		&models.Achievement{},
		&models.UserAchievement{},
		&models.Review{},
		&models.ModerationLog{},
		&models.AILog{},
	)
}

func RunDownMigrations(db *gorm.DB) error {
	tables := []string{
		"ai_logs", "moderation_logs", "reviews", "user_achievements", "achievements",
		"xp_events", "user_progresses", "quiz_questions", "tasks", "lessons", "modules", "users",
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
