package routes

import (
	"devanta/backend/docs"
	"devanta/backend/internal/handlers"
	"devanta/backend/internal/middleware"
	"devanta/backend/internal/services"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/swagger"
)

func Register(app *fiber.App, s *services.Container) {
	app.Use(cors.New(cors.Config{
		AllowOrigins:     s.Config.CORSOrigin,
		AllowCredentials: true,
	}))
	app.Get("/health", func(c *fiber.Ctx) error { return c.JSON(fiber.Map{"status": "ok"}) })

	serveOpenAPI := func(c *fiber.Ctx) error {
		c.Set("Content-Type", "application/yaml; charset=utf-8")
		return c.Send(docs.OpenAPISpec)
	}
	// Спека: корень (удобно для nginx /openapi.yaml) и старый путь под /api.
	app.Get("/openapi.yaml", serveOpenAPI)
	app.Get("/api/docs/openapi.yaml", serveOpenAPI)

	swaggerCfg := swagger.Config{
		Title:                "Devanta API",
		URL:                  "/openapi.yaml",
		TryItOutEnabled:      true,
		PersistAuthorization: true,
		DeepLinking:          true,
		ValidatorUrl:         "none",
	}
	// Отдельный handler на каждый префикс: у middleware свой sync.Once для base path.
	app.Get("/swagger/*", swagger.New(swaggerCfg))
	app.Get("/api/swagger/*", swagger.New(swaggerCfg))

	auth := handlers.NewAuthHandler(s)
	learning := handlers.NewLearningHandler(s)
	quiz := handlers.NewQuizHandler(s)
	progress := handlers.NewProgressHandler(s)
	me := handlers.NewMeHandler(s)
	parent := handlers.NewParentHandler(s)
	settings := handlers.NewSettingsHandler(s)
	faq := handlers.NewFAQHandler(s)
	review := handlers.NewReviewHandler(s)
	moderation := handlers.NewModerationHandler(s)
	admin := handlers.NewAdminHandler(s)

	api := app.Group("/api")
	api.Post("/auth/register", auth.Register)
	api.Post("/auth/login", auth.Login)
	api.Post("/auth/refresh", auth.Refresh)
	api.Post("/auth/logout", auth.Logout)

	api.Get("/modules", middleware.JWTProtected(s.Config.JWTSecret, "student"), learning.GetModules)
	api.Get("/modules/:id/course", middleware.JWTProtected(s.Config.JWTSecret, "student"), learning.GetModuleCourse)
	api.Get("/modules/:id/lessons", learning.GetLessons)
	api.Get("/lessons/:id", learning.GetLesson)
	api.Get("/tasks/special", middleware.JWTProtected(s.Config.JWTSecret, "student"), learning.GetSpecialChallenges)
	api.Get("/tasks", middleware.JWTProtected(s.Config.JWTSecret, "student"), learning.GetTasks)
	api.Get("/tasks/:id", middleware.JWTProtected(s.Config.JWTSecret, "student"), learning.GetTask)
	api.Post("/tasks/:id/submit", middleware.JWTProtected(s.Config.JWTSecret, "student"), learning.SubmitTask)
	api.Get("/lessons/:id/task", middleware.JWTProtected(s.Config.JWTSecret, "student"), learning.GetTaskByLesson)

	api.Get("/quiz/:moduleId", quiz.GetQuiz)
	api.Post("/quiz/:moduleId/submit", middleware.JWTProtected(s.Config.JWTSecret, "student"), quiz.Submit)

	api.Get("/progress", middleware.JWTProtected(s.Config.JWTSecret, "student"), progress.GetProgress)
	api.Get("/me/summary", middleware.JWTProtected(s.Config.JWTSecret, "student"), me.Summary)
	api.Get("/me/activity", middleware.JWTProtected(s.Config.JWTSecret, "student"), me.Activity)
	api.Get("/me/achievements", middleware.JWTProtected(s.Config.JWTSecret, "student"), me.Achievements)
	api.Get("/leaderboard", middleware.JWTProtected(s.Config.JWTSecret, "student"), progress.GetLeaderboard)
	api.Get("/parent/invite", middleware.JWTProtected(s.Config.JWTSecret, "student"), parent.GetInvite)
	api.Get("/parent/connect", parent.Connect)

	api.Get("/reviews", review.GetReviews)
	api.Get("/faq", faq.GetFAQ)
	api.Get("/settings/profile", middleware.JWTProtected(s.Config.JWTSecret, "student"), settings.GetProfile)
	api.Put("/settings/profile", middleware.JWTProtected(s.Config.JWTSecret, "student"), settings.UpdateProfile)
	api.Put("/settings/notifications", middleware.JWTProtected(s.Config.JWTSecret, "student"), settings.UpdateNotifications)
	api.Post("/settings/password", middleware.JWTProtected(s.Config.JWTSecret, "student"), settings.ChangePassword)
	api.Post("/settings/avatar", middleware.JWTProtected(s.Config.JWTSecret, "student"), settings.UploadAvatar)
	api.Delete("/settings/account", middleware.JWTProtected(s.Config.JWTSecret, "student"), settings.DeleteAccount)
	api.Post("/reviews", middleware.JWTProtected(s.Config.JWTSecret, "student"), review.CreateReview)

	api.Get("/moderation/reviews", middleware.JWTProtected(s.Config.JWTSecret, "moderator", "admin"), moderation.GetReviews)
	api.Post("/moderation/reviews/:id/publish", middleware.JWTProtected(s.Config.JWTSecret, "moderator", "admin"), moderation.Publish)
	api.Post("/moderation/reviews/:id/reject", middleware.JWTProtected(s.Config.JWTSecret, "moderator", "admin"), moderation.Reject)

	api.Get("/admin/users", middleware.JWTProtected(s.Config.JWTSecret, "admin"), admin.GetUsers)
	api.Post("/admin/faq", middleware.JWTProtected(s.Config.JWTSecret, "admin"), faq.AdminCreateFAQ)
	api.Put("/admin/faq/:id", middleware.JWTProtected(s.Config.JWTSecret, "admin"), faq.AdminUpdateFAQ)
	api.Delete("/admin/faq/:id", middleware.JWTProtected(s.Config.JWTSecret, "admin"), faq.AdminDeleteFAQ)
	api.Post("/admin/block", middleware.JWTProtected(s.Config.JWTSecret, "admin"), admin.Block)
	api.Post("/admin/role", middleware.JWTProtected(s.Config.JWTSecret, "admin"), admin.Role)
}
