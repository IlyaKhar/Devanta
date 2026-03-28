package routes

import (
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// RegisterUploads — отдача файлов из ./uploads (аватары). Явный SendFile надёжнее fiber.Static в Docker.
func RegisterUploads(app *fiber.App) {
	root, err := filepath.Abs("uploads")
	if err != nil {
		log.Fatalf("uploads abs path: %v", err)
	}
	if err := os.MkdirAll(filepath.Join(root, "avatars"), 0o755); err != nil {
		log.Fatalf("uploads mkdir: %v", err)
	}
	log.Printf("uploads serve root: %s", root)

	serve := func(c *fiber.Ctx) error {
		tail := strings.Trim(strings.TrimSpace(c.Params("*")), "/")
		if tail == "" {
			return fiber.ErrNotFound
		}
		for _, seg := range strings.Split(tail, "/") {
			if seg == "" || seg == "." || seg == ".." {
				return fiber.ErrNotFound
			}
		}
		full := filepath.Join(root, filepath.FromSlash(tail))
		rel, err := filepath.Rel(root, full)
		if err != nil || strings.HasPrefix(rel, "..") {
			return fiber.ErrNotFound
		}
		st, err := os.Stat(full)
		if err != nil || st.IsDir() {
			return fiber.ErrNotFound
		}
		return c.SendFile(full)
	}

	// Старый путь (nginx ^~ /uploads) и новый под префиксом API — один handler, один физический каталог.
	app.Get("/uploads/*", serve)
	app.Get("/api/uploads/*", serve)
}
