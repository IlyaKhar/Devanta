package routes

import (
	"devanta/backend/internal/handlers"
	"devanta/backend/internal/middleware"
	"devanta/backend/internal/services"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func Register(app *fiber.App, s *services.Container) {
	app.Use(cors.New(cors.Config{AllowOrigins: s.Config.CORSOrigin}))
	app.Get("/health", func(c *fiber.Ctx) error { return c.JSON(fiber.Map{"status": "ok"}) })

	auth := handlers.NewAuthHandler(s)
	learning := handlers.NewLearningHandler(s)
	quiz := handlers.NewQuizHandler(s)
	progress := handlers.NewProgressHandler(s)
	review := handlers.NewReviewHandler(s)
	moderation := handlers.NewModerationHandler(s)
	admin := handlers.NewAdminHandler(s)
	ai := handlers.NewAIHandler(s)

	api := app.Group("/api")
	api.Post("/auth/register", auth.Register)
	api.Post("/auth/login", auth.Login)
	api.Post("/auth/refresh", auth.Refresh)

	api.Get("/modules", learning.GetModules)
	api.Get("/modules/:id/lessons", learning.GetLessons)
	api.Get("/lessons/:id", learning.GetLesson)
	api.Post("/tasks/:id/submit", middleware.JWTProtected(s.Config.JWTSecret, "student"), learning.SubmitTask)

	api.Get("/quiz/:moduleId", quiz.GetQuiz)
	api.Post("/quiz/submit", middleware.JWTProtected(s.Config.JWTSecret, "student"), quiz.Submit)

	api.Get("/progress", middleware.JWTProtected(s.Config.JWTSecret, "student"), progress.GetProgress)
	api.Get("/leaderboard", progress.GetLeaderboard)

	api.Get("/reviews", review.GetReviews)
	api.Post("/reviews", middleware.JWTProtected(s.Config.JWTSecret, "student"), review.CreateReview)

	api.Get("/moderation/reviews", middleware.JWTProtected(s.Config.JWTSecret, "moderator", "admin"), moderation.GetReviews)
	api.Post("/moderation/reviews/:id/publish", middleware.JWTProtected(s.Config.JWTSecret, "moderator", "admin"), moderation.Publish)
	api.Post("/moderation/reviews/:id/reject", middleware.JWTProtected(s.Config.JWTSecret, "moderator", "admin"), moderation.Reject)

	api.Get("/admin/users", middleware.JWTProtected(s.Config.JWTSecret, "admin"), admin.GetUsers)
	api.Post("/admin/block", middleware.JWTProtected(s.Config.JWTSecret, "admin"), admin.Block)
	api.Post("/admin/role", middleware.JWTProtected(s.Config.JWTSecret, "admin"), admin.Role)

	api.Post("/ai/explain", middleware.JWTProtected(s.Config.JWTSecret, "student"), ai.Explain)
	api.Post("/ai/hint", middleware.JWTProtected(s.Config.JWTSecret, "student"), ai.Hint)
	api.Post("/ai/check", middleware.JWTProtected(s.Config.JWTSecret, "student"), ai.Check)
	api.Get("/ai/limits", middleware.JWTProtected(s.Config.JWTSecret, "student"), ai.Limits)
}
