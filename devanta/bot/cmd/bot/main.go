package main

import (
	"log"
	"os"
	"time"

	"devanta/bot/internal/client"
	tele "gopkg.in/telebot.v3"
)

func main() {
	token := os.Getenv("TELEGRAM_BOT_TOKEN")
	if token == "" {
		log.Fatal("TELEGRAM_BOT_TOKEN is required")
	}

	apiBase := os.Getenv("BACKEND_PUBLIC_URL")
	if apiBase == "" {
		apiBase = "http://backend:8080"
	}
	cl := client.NewBackendClient(apiBase)

	b, err := tele.NewBot(tele.Settings{
		Token:  token,
		Poller: &tele.LongPoller{Timeout: 10 * time.Second},
	})
	if err != nil {
		log.Fatal(err)
	}

	b.Handle("/start", func(c tele.Context) error {
		return c.Send("Max приветствует тебя! Команды: /lesson /quiz /progress /ask")
	})

	b.Handle("/lesson", func(c tele.Context) error {
		msg, err := cl.GetLesson()
		if err != nil {
			return c.Send("Не удалось получить урок")
		}
		return c.Send(msg)
	})

	b.Handle("/quiz", func(c tele.Context) error {
		return c.Send("Квиз: открой приложение или используй /ask для подсказки.")
	})

	b.Handle("/progress", func(c tele.Context) error {
		msg, err := cl.GetProgress()
		if err != nil {
			return c.Send("Не удалось получить прогресс")
		}
		return c.Send(msg)
	})

	b.Handle("/ask", func(c tele.Context) error {
		msg, err := cl.AskMax("объясни цикл for")
		if err != nil {
			return c.Send("Max временно недоступен")
		}
		return c.Send(msg)
	})

	b.Start()
}
