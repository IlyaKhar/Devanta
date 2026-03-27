package bot

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"
	"unicode"

	"devanta/support-bot/internal/config"
	"devanta/support-bot/internal/services"
	tele "gopkg.in/telebot.v3"
)

type Bot struct {
	bot *tele.Bot
	webhook *tele.Webhook

	menu *Menu
	faq  []FAQItem

	support *services.SupportService
}

func New(cfg config.Config, support *services.SupportService) (*Bot, error) {
	token := cfg.TelegramBotToken
	if strings.TrimSpace(token) == "" {
		return nil, fmt.Errorf("SUPPORT_TELEGRAM_BOT_TOKEN is required")
	}

	var poller tele.Poller = &tele.LongPoller{Timeout: 10 * time.Second}
	var webhook *tele.Webhook
	if cfg.WebhookPublicURL != "" {
		publicURL := cfg.WebhookPublicURL + cfg.WebhookPath
		webhook = &tele.Webhook{
			Endpoint: &tele.WebhookEndpoint{
				PublicURL: publicURL,
			},
			SecretToken: cfg.WebhookSecretToken,
			DropUpdates: true,
		}
		poller = webhook
	}

	b, err := tele.NewBot(tele.Settings{
		Token:  token,
		Poller: poller,
	})
	if err != nil {
		return nil, err
	}

	bt := &Bot{
		bot:     b,
		webhook: webhook,
		menu:    NewMenu(),
		faq:     DefaultFAQ(),
		support: support,
	}

	bt.register()
	return bt, nil
}

func (b *Bot) Start() {
	if b.webhook != nil {
		log.Println("support-bot telegram started (webhook)")
	} else {
		log.Println("support-bot telegram started (long poll)")
	}
	b.bot.Start()
}

func (b *Bot) Stop() {
	b.bot.Stop()
}

func (b *Bot) WebhookHandler() http.Handler {
	if b.webhook == nil {
		return nil
	}
	return b.webhook
}

func (b *Bot) register() {
	b.bot.Handle("/tickets", func(c tele.Context) error {
		if c.Sender() == nil || !b.support.IsAdmin(c.Sender().ID) {
			return nil
		}

		rows, err := b.support.ListRecentTickets(10)
		if err != nil {
			return c.Send("Не смог получить список обращений.")
		}
		if len(rows) == 0 {
			return c.Send("Обращений пока нет.")
		}

		if err := c.Send("Последние обращения (нажми кнопку):"); err != nil {
			return err
		}

		for _, t := range rows {
			markup := &tele.ReplyMarkup{}
			btnOpen := markup.Data("📄 Открыть", "ticket_open", fmt.Sprintf("%d", t.ID))
			btnClose := markup.Data("✅ Закрыть", "ticket_close", fmt.Sprintf("%d", t.ID))
			markup.Inline(markup.Row(btnOpen, btnClose))

			_ = c.Send(fmt.Sprintf(
				"#%d (%s) от %d (@%s)\n%s",
				t.ID,
				t.Status,
				t.UserTelegramID,
				emptyAsDashLocal(t.Username),
				t.Preview,
			), markup)
		}

		return nil
	})

	b.bot.Handle("/ticket", func(c tele.Context) error {
		if c.Sender() == nil || !b.support.IsAdmin(c.Sender().ID) {
			return nil
		}
		id, ok := b.support.ParseTicketIDFromCommand(c.Text())
		if !ok {
			return c.Send("Формат: /ticket <id>")
		}

		d, err := b.support.GetTicketDetails(id)
		if err != nil {
			return c.Send("Не нашёл обращение.")
		}

		var sb strings.Builder
		sb.WriteString(fmt.Sprintf(
			"Обращение #%d (%s)\nОт: %d (@%s)\n\nТекст:\n%s\n\n",
			d.Ticket.ID,
			d.Ticket.Status,
			d.User.TelegramID,
			emptyAsDashLocal(d.User.Username),
			d.Ticket.Text,
		))
		if len(d.Messages) > 0 {
			sb.WriteString("Последние сообщения:\n")
			for i := 0; i < len(d.Messages) && i < 10; i++ {
				m := d.Messages[i]
				sb.WriteString(fmt.Sprintf("- %s → %s: %s\n", m.FromRole, m.ToRole, previewLocal(m.Text, 80)))
			}
		}
		return c.Send(sb.String())
	})

	b.bot.Handle("/start", func(c tele.Context) error {
		_, _ = b.support.UpsertUser(c.Sender())
		b.support.ResetMode(c.Sender().ID)
		return c.Send("Привет! Я бот поддержки Devanta. Чем помочь?", b.menu.Main)
	})

	b.bot.Handle(&b.menu.BtnAbout, func(c tele.Context) error {
		_, _ = b.support.UpsertUser(c.Sender())
		b.support.ResetMode(c.Sender().ID)
		return c.Send(b.support.AboutText(), b.menu.Main)
	})

	b.bot.Handle(&b.menu.BtnFAQ, func(c tele.Context) error {
		_, _ = b.support.UpsertUser(c.Sender())
		b.support.ResetMode(c.Sender().ID)

		markup := &tele.ReplyMarkup{}
		rows := make([]tele.Row, 0, len(b.faq))
		for i, item := range b.faq {
			btn := markup.Data(item.Question, "faq", strconv.Itoa(i))
			rows = append(rows, markup.Row(btn))
		}
		markup.Inline(rows...)

		return c.Send("Выбери вопрос:", markup)
	})

	b.bot.Handle(tele.OnCallback, func(c tele.Context) error {
		if c.Callback() == nil {
			return nil
		}

		cb := c.Callback()
		data := sanitizeCallbackData(cb.Data)
		if cb.Sender != nil {
			log.Printf("callback: from=%d unique=%q data=%q", cb.Sender.ID, cb.Unique, cb.Data)
		} else {
			log.Printf("callback: sender=nil unique=%q data=%q", cb.Unique, cb.Data)
		}

		// Админские callback-кнопки
		if cb.Sender != nil && b.support.IsAdmin(cb.Sender.ID) {
			if cb.Unique == "ticket_open" || strings.HasPrefix(data, "ticket_open|") {
				id, ok := parseCallbackUint(cb, data, "ticket_open")
				if !ok {
					_ = c.Respond()
					return nil
				}
				d, err := b.support.GetTicketDetails(id)
				if err != nil {
					_ = c.Respond()
					return nil
				}
				_ = c.Respond()
				return c.Send(formatTicketDetails(d))
			}

			if cb.Unique == "ticket_close" || strings.HasPrefix(data, "ticket_close|") {
				id, ok := parseCallbackUint(cb, data, "ticket_close")
				if !ok {
					_ = c.Respond()
					return nil
				}
				_ = b.support.CloseTicket(id)
				_ = c.Respond(&tele.CallbackResponse{Text: "Закрыл"})
				return c.Send(fmt.Sprintf("Тикет #%d закрыт.", id))
			}
		}

		// telebot может прислать либо:
		// - Unique="faq", Data="0"
		// - Unique="",   Data="faq|0" (иногда с управляющими символами в начале)
		var rawIdx string
		switch {
		case cb.Unique == "faq":
			rawIdx = data
		case strings.HasPrefix(data, "faq|"):
			rawIdx = strings.TrimPrefix(data, "faq|")
		default:
			_ = c.Respond()
			return nil
		}

		idx, err := strconv.Atoi(rawIdx)
		if err != nil || idx < 0 || idx >= len(b.faq) {
			_ = c.Respond()
			return nil
		}
		item := b.faq[idx]
		_ = c.Respond()
		return c.Send("❓ "+item.Question+"\n\n"+item.Answer, b.menu.Main)
	})

	b.bot.Handle(&b.menu.BtnChatAdmin, func(c tele.Context) error {
		_, _ = b.support.UpsertUser(c.Sender())
		b.support.SetChatToAdmin(c.Sender().ID)
		return c.Send("Ок. Пиши сообщение — я перешлю администратору. Чтобы выйти, нажми «🔙 Назад».", b.backOnly())
	})

	b.bot.Handle(&b.menu.BtnCreateTicket, func(c tele.Context) error {
		_, _ = b.support.UpsertUser(c.Sender())
		b.support.SetCreatingTicket(c.Sender().ID)
		return c.Send("Напиши текст обращения одним сообщением. Чтобы отменить, нажми «🔙 Назад».", b.backOnly())
	})

	b.bot.Handle(&b.menu.BtnBack, func(c tele.Context) error {
		_, _ = b.support.UpsertUser(c.Sender())
		b.support.ResetMode(c.Sender().ID)
		return c.Send("Вернулся в меню.", b.menu.Main)
	})

	// Важно: reply-логика для админов (ответы пользователю)
	b.bot.Handle(tele.OnText, func(c tele.Context) error {
		if c.Message() == nil || c.Sender() == nil {
			return nil
		}

		if handled, err := b.support.HandleAdminReply(b.bot, c.Message()); handled {
			if err != nil {
				return c.Send("Не удалось отправить ответ пользователю.")
			}
			return nil
		}

		_, _ = b.support.UpsertUser(c.Sender())

		mode := b.support.GetMode(c.Sender().ID)
		switch mode {
		case services.UserModeChatToAdmin:
			user, err := b.support.UpsertUser(c.Sender())
			if err != nil {
				return c.Send("Что-то пошло не так. Попробуй ещё раз.", b.menu.Main)
			}
			_, err = b.support.ForwardUserMessageToAdmins(b.bot, user, c.Message())
			if err != nil {
				return c.Send("Не смог связаться с админом. Проверь настройки админов и попробуй позже.", b.menu.Main)
			}
			return c.Send("Отправил админу. Ждём ответ.", b.backOnly())

		case services.UserModeCreatingTicket:
			user, err := b.support.UpsertUser(c.Sender())
			if err != nil {
				return c.Send("Что-то пошло не так. Попробуй ещё раз.", b.menu.Main)
			}
			t, err := b.support.CreateTicket(user, c.Text())
			if err != nil {
				return c.Send("Текст пустой. Напиши обращение одним сообщением.", b.backOnly())
			}
			b.support.ResetMode(c.Sender().ID)
			_ = b.support.NotifyAdminsTicket(b.bot, user, t)
			return c.Send("Принял обращение. Мы скоро ответим.", b.menu.Main)

		default:
			return nil
		}
	})
}

func (b *Bot) backOnly() *tele.ReplyMarkup {
	m := &tele.ReplyMarkup{ResizeKeyboard: true}
	btnBack := m.Text("🔙 Назад")
	m.Reply(m.Row(btnBack))
	return m
}

func emptyAsDashLocal(s string) string {
	if strings.TrimSpace(s) == "" {
		return "-"
	}
	return s
}

func previewLocal(s string, max int) string {
	s = strings.TrimSpace(s)
	s = strings.ReplaceAll(s, "\n", " ")
	if max <= 0 {
		max = 80
	}
	r := []rune(s)
	if len(r) <= max {
		return s
	}
	return string(r[:max]) + "…"
}

func parseCallbackUint(cb *tele.Callback, sanitizedData string, name string) (uint, bool) {
	var raw string
	switch {
	case cb.Unique == name:
		raw = sanitizedData
	case strings.HasPrefix(sanitizedData, name+"|"):
		raw = strings.TrimPrefix(sanitizedData, name+"|")
	default:
		return 0, false
	}
	n, err := strconv.ParseUint(raw, 10, 64)
	if err != nil || n == 0 {
		return 0, false
	}
	return uint(n), true
}

func formatTicketDetails(d *services.TicketDetails) string {
	var sb strings.Builder
	sb.WriteString(fmt.Sprintf(
		"Обращение #%d (%s)\nОт: %d (@%s)\n\nТекст:\n%s\n\n",
		d.Ticket.ID,
		d.Ticket.Status,
		d.User.TelegramID,
		emptyAsDashLocal(d.User.Username),
		d.Ticket.Text,
	))
	if len(d.Messages) > 0 {
		sb.WriteString("Последние сообщения:\n")
		for i := 0; i < len(d.Messages) && i < 10; i++ {
			m := d.Messages[i]
			sb.WriteString(fmt.Sprintf("- %s → %s: %s\n", m.FromRole, m.ToRole, previewLocal(m.Text, 80)))
		}
	}
	return sb.String()
}

func sanitizeCallbackData(s string) string {
	return strings.TrimLeftFunc(s, func(r rune) bool {
		return unicode.IsControl(r) || unicode.IsSpace(r)
	})
}

