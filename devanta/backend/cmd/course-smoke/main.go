// Утилита: без кликов в UI — прокачать модуль в БД (уроки + все квизы, включая итог блок 11)
// и проверить через API, что /modules/:id/course отдаёт полный прогресс.
//
// Нужны: работающий Postgres (DATABASE_URL), запущенный backend (для HTTP-части).
//
//	cd backend && go run ./cmd/course-smoke -email=you@mail.ru -password=secret -module=1
//	только БД: ... -module=1 -db-only  (пароль не нужен)
//
// База API по умолчанию http://127.0.0.1:8080/api; из контейнера к backend: -api http://backend:8080/api
package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"devanta/backend/internal/config"
	"devanta/backend/internal/database"
)

func main() {
	email := flag.String("email", "", "email ученика (обязательно)")
	password := flag.String("password", "", "пароль (обязательно)")
	moduleID := flag.Uint("module", 0, "id модуля (обязательно)")
	apiBase := flag.String("api", envOrDefault("SMOKE_API_BASE", "http://127.0.0.1:8080/api"), "базовый URL API, например http://127.0.0.1:8080/api")
	skipHTTP := flag.Bool("db-only", false, "только запись в БД (без проверки HTTP; сервер не нужен)")
	flag.Parse()

	if *email == "" || *moduleID == 0 {
		flag.Usage()
		os.Exit(1)
	}
	if !*skipHTTP && *password == "" {
		fmt.Fprintln(os.Stderr, "нужен -password (или -db-only без HTTP)")
		os.Exit(1)
	}

	cfg := config.Load()
	db := database.Connect(cfg.DatabaseURL)
	if err := database.DemoCompleteCourse(db, *email, *moduleID); err != nil {
		fmt.Fprintf(os.Stderr, "DB: %v\n", err)
		os.Exit(1)
	}

	if *skipHTTP {
		fmt.Println("OK (только БД): прогресс выставлен, HTTP-пропуск по -db-only")
		return
	}

	token, err := login(*apiBase, *email, *password)
	if err != nil {
		fmt.Fprintf(os.Stderr, "login: %v\n", err)
		os.Exit(1)
	}

	body, err := getCourse(*apiBase, token, *moduleID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "GET course: %v\n", err)
		os.Exit(1)
	}

	var resp courseAPIResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		fmt.Fprintf(os.Stderr, "JSON: %v\n", err)
		os.Exit(1)
	}

	if len(resp.Lessons) == 0 {
		fmt.Fprintf(os.Stderr, "в ответе курса нет уроков\n")
		os.Exit(1)
	}

	if resp.Progress < 100 {
		fmt.Fprintf(os.Stderr, "прогресс курса %d%% (ожидали 100%%)\n", resp.Progress)
		os.Exit(1)
	}

	last := resp.Lessons[len(resp.Lessons)-1]
	if !last.Completed || !last.QuizPassed {
		fmt.Fprintf(os.Stderr, "последний урок: completed=%v quizPassed=%v (ожидали оба true)\n", last.Completed, last.QuizPassed)
		os.Exit(1)
	}

	fmt.Printf("OK: API подтверждает progress=%d%%, итоговый урок sortOrder=%d — урок и тест закрыты.\n", resp.Progress, last.SortOrder)
}

type courseAPIResponse struct {
	Progress int `json:"progress"`
	Lessons  []struct {
		SortOrder  int  `json:"sortOrder"`
		Completed  bool `json:"completed"`
		QuizPassed bool `json:"quizPassed"`
	} `json:"lessons"`
}

func envOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func login(base, email, password string) (string, error) {
	payload := map[string]string{"email": email, "password": password}
	raw, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}
	req, err := http.NewRequest(http.MethodPost, trimSlash(base)+"/auth/login", bytes.NewReader(raw))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 15 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()
	b, rerr := io.ReadAll(res.Body)
	if rerr != nil {
		return "", rerr
	}
	if res.StatusCode != http.StatusOK {
		return "", fmt.Errorf("HTTP %d: %s", res.StatusCode, string(b))
	}
	var out struct {
		AccessToken string `json:"accessToken"`
	}
	if err := json.Unmarshal(b, &out); err != nil {
		return "", err
	}
	if out.AccessToken == "" {
		return "", fmt.Errorf("нет accessToken в ответе")
	}
	return out.AccessToken, nil
}

func getCourse(base, token string, moduleID uint) ([]byte, error) {
	url := fmt.Sprintf("%s/modules/%d/course", trimSlash(base), moduleID)
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{Timeout: 15 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	b, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP %d: %s", res.StatusCode, string(b))
	}
	return b, nil
}

func trimSlash(s string) string {
	for len(s) > 0 && s[len(s)-1] == '/' {
		s = s[:len(s)-1]
	}
	return s
}
