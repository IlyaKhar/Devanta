package services

import (
	"devanta/backend/internal/config"
	"devanta/backend/internal/repositories"
	"gorm.io/gorm"
)

type Container struct {
	Config               config.Config
	DB                   *gorm.DB
	UserRepo             *repositories.UserRepository
	FAQRepo              *repositories.FAQRepository
	ModuleRepo           *repositories.ModuleRepository
	LessonRepo           *repositories.LessonRepository
	QuizRepo             *repositories.QuizRepository
	BlockQuizResultRepo  *repositories.BlockQuizResultRepository
	TaskRepo             *repositories.TaskRepository
	SpecialChallengeRepo *repositories.SpecialChallengeRepository
	ParentConnectionRepo *repositories.ParentConnectionRepository
	AuthService          *AuthService
	Gamification         *GamificationService
}

func NewContainer(cfg config.Config, db *gorm.DB) *Container {
	userRepo := repositories.NewUserRepository(db)
	faqRepo := repositories.NewFAQRepository(db)
	moduleRepo := repositories.NewModuleRepository(db)
	lessonRepo := repositories.NewLessonRepository(db)
	quizRepo := repositories.NewQuizRepository(db)
	blockQuizResultRepo := repositories.NewBlockQuizResultRepository(db)
	taskRepo := repositories.NewTaskRepository(db)
	specialChallengeRepo := repositories.NewSpecialChallengeRepository(db)
	parentConnectionRepo := repositories.NewParentConnectionRepository(db)

	return &Container{
		Config:               cfg,
		DB:                   db,
		UserRepo:             userRepo,
		FAQRepo:              faqRepo,
		ModuleRepo:           moduleRepo,
		LessonRepo:           lessonRepo,
		QuizRepo:             quizRepo,
		BlockQuizResultRepo:  blockQuizResultRepo,
		TaskRepo:             taskRepo,
		SpecialChallengeRepo: specialChallengeRepo,
		ParentConnectionRepo: parentConnectionRepo,
		AuthService:          NewAuthService(cfg.JWTSecret, userRepo),
		Gamification:         NewGamificationService(db),
	}
}
