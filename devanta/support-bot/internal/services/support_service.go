package services

import (
	"errors"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"devanta/support-bot/internal/config"
	"devanta/support-bot/internal/models"
	"devanta/support-bot/internal/repository"
	tele "gopkg.in/telebot.v3"
)

type SupportService struct {
	cfg config.Config
	fsm *FSM

	users    *repository.UserRepository
	messages *repository.MessageRepository
	tickets  *repository.TicketRepository
}

func NewSupportService(
	cfg config.Config,
	fsm *FSM,
	users *repository.UserRepository,
	messages *repository.MessageRepository,
	tickets *repository.TicketRepository,
) *SupportService {
	return &SupportService{
		cfg:      cfg,
		fsm:      fsm,
		users:    users,
		messages: messages,
		tickets:  tickets,
	}
}

func (s *SupportService) UpsertUser(tg *tele.User) (*models.User, error) {
	if tg == nil {
		return nil, errors.New("telegram user is nil")
	}
	return s.users.UpsertByTelegramID(models.User{
		TelegramID: tg.ID,
		Username:   tg.Username,
		FirstName:  tg.FirstName,
		LastName:   tg.LastName,
	})
}

func (s *SupportService) IsAdmin(telegramID int64) bool {
	for _, id := range s.cfg.Admins {
		if id == telegramID {
			return true
		}
	}
	return false
}

func (s *SupportService) AdminIDs() []int64 {
	out := make([]int64, 0, len(s.cfg.Admins))
	out = append(out, s.cfg.Admins...)
	return out
}

func (s *SupportService) AboutText() string {
	return s.cfg.AboutText
}

func (s *SupportService) ResetMode(userTelegramID int64) {
	s.fsm.Reset(userTelegramID)
}

func (s *SupportService) SetChatToAdmin(userTelegramID int64) {
	s.fsm.Set(userTelegramID, UserModeChatToAdmin)
}

func (s *SupportService) SetCreatingTicket(userTelegramID int64) {
	s.fsm.Set(userTelegramID, UserModeCreatingTicket)
}

func (s *SupportService) GetMode(userTelegramID int64) UserMode {
	return s.fsm.Get(userTelegramID)
}

func (s *SupportService) CreateTicket(user *models.User, text string) (*models.Ticket, error) {
	text = strings.TrimSpace(text)
	if text == "" {
		return nil, errors.New("ticket text is empty")
	}
	return s.tickets.Create(models.Ticket{
		UserID: user.ID,
		Text:   text,
		Status: "open",
	})
}

func (s *SupportService) NotifyAdminsTicket(b *tele.Bot, user *models.User, t *models.Ticket) error {
	admins := s.AdminIDs()
	if len(admins) == 0 {
		return nil
	}

	msg := fmt.Sprintf(
		"Новое обращение #%d\n\nОт: %d (@%s)\n\nТекст:\n%s\n\nОтветь reply на это сообщение — я отправлю ответ пользователю.",
		t.ID,
		user.TelegramID,
		emptyAsDash(user.Username),
		t.Text,
	)

	// Важно: сохраняем связку adminMessageID -> user, чтобы reply-логика работала.
	for _, adminID := range admins {
		sent, err := b.Send(&tele.User{ID: adminID}, msg)
		if err != nil {
			continue
		}
		_, _ = s.messages.Create(models.Message{
			UserID:                 user.ID,
			FromRole:               "user",
			ToRole:                 "admin",
			Text:                   t.Text,
			AdminTelegramID:         adminID,
			UserTelegramMessageID:   0,
			AdminTelegramMessageID:  sent.ID,
			CreatedAt:               time.Now(),
		})
	}
	return nil
}

type ForwardedToAdmin struct {
	AdminID            int64
	AdminMessageID     int
	OriginalUserMsgID  int
}

func (s *SupportService) ForwardUserMessageToAdmins(b *tele.Bot, user *models.User, userMsg *tele.Message) ([]ForwardedToAdmin, error) {
	if len(s.cfg.Admins) == 0 {
		return nil, errors.New("SUPPORT_ADMINS is empty")
	}
	if userMsg == nil {
		return nil, errors.New("message is nil")
	}

	text := strings.TrimSpace(userMsg.Text)
	if text == "" {
		return nil, errors.New("empty message")
	}

	header := fmt.Sprintf(
		"Сообщение от пользователя:\n- id: %d\n- username: @%s\n- name: %s %s\n\nОтветь reply на это сообщение.",
		user.TelegramID,
		emptyAsDash(user.Username),
		emptyAsDash(user.FirstName),
		emptyAsDash(user.LastName),
	)
	body := fmt.Sprintf("%s\n\n---\n%s", header, text)

	out := make([]ForwardedToAdmin, 0, len(s.cfg.Admins))
	for _, adminID := range s.cfg.Admins {
		admin := &tele.User{ID: adminID}
		sent, err := b.Send(admin, body)
		if err != nil {
			continue
		}

		_, _ = s.messages.Create(models.Message{
			UserID:                user.ID,
			FromRole:              "user",
			ToRole:                "admin",
			Text:                  text,
			AdminTelegramID:        adminID,
			UserTelegramMessageID:  userMsg.ID,
			AdminTelegramMessageID: sent.ID,
			CreatedAt:              time.Now(),
		})

		out = append(out, ForwardedToAdmin{
			AdminID:           adminID,
			AdminMessageID:    sent.ID,
			OriginalUserMsgID: userMsg.ID,
		})
	}

	if len(out) == 0 {
		return nil, errors.New("failed to notify admins")
	}
	return out, nil
}

func (s *SupportService) HandleAdminReply(b *tele.Bot, adminMsg *tele.Message) (handled bool, err error) {
	if adminMsg == nil || adminMsg.Sender == nil {
		return false, nil
	}
	if !s.IsAdmin(adminMsg.Sender.ID) {
		return false, nil
	}
	if adminMsg.ReplyTo == nil {
		return false, nil
	}

	orig, err := s.messages.FindByAdminReply(adminMsg.Sender.ID, adminMsg.ReplyTo.ID)
	if err != nil {
		log.Printf("admin reply mapping not found: admin=%d replyTo=%d err=%v", adminMsg.Sender.ID, adminMsg.ReplyTo.ID, err)
		_, _ = b.Send(&tele.User{ID: adminMsg.Sender.ID}, "Не понял, кому отвечать. Отвечай reply на сообщение от бота (пересланное пользователем/обращение).")
		return true, nil
	}

	user, err := s.users.GetByID(orig.UserID)
	if err != nil {
		log.Printf("admin reply user not found: userID=%d err=%v", orig.UserID, err)
		_, _ = b.Send(&tele.User{ID: adminMsg.Sender.ID}, "Не смог найти пользователя для ответа. Возможно, запись в БД отсутствует.")
		return true, nil
	}

	text := strings.TrimSpace(adminMsg.Text)
	if text == "" {
		return true, nil
	}

	_, sendErr := b.Send(&tele.User{ID: user.TelegramID}, "Ответ администратора:\n\n"+text)
	if sendErr != nil {
		return true, sendErr
	}

	_, _ = s.messages.Create(models.Message{
		UserID:           orig.UserID,
		FromRole:         "admin",
		ToRole:           "user",
		Text:             text,
		AdminTelegramID:  adminMsg.Sender.ID,
		CreatedAt:        time.Now(),
	})

	return true, nil
}

type TicketSummary struct {
	ID             uint
	Status         string
	UserTelegramID int64
	Username       string
	Preview        string
	CreatedAt      time.Time
}

func (s *SupportService) ListRecentTickets(limit int) ([]TicketSummary, error) {
	rows, err := s.tickets.ListRecent(limit)
	if err != nil {
		return nil, err
	}
	out := make([]TicketSummary, 0, len(rows))
	for _, t := range rows {
		u, err := s.users.GetByID(t.UserID)
		if err != nil {
			continue
		}
		out = append(out, TicketSummary{
			ID:             t.ID,
			Status:         t.Status,
			UserTelegramID: u.TelegramID,
			Username:       u.Username,
			Preview:        previewText(t.Text, 80),
			CreatedAt:      t.CreatedAt,
		})
	}
	return out, nil
}

type TicketDetails struct {
	Ticket   models.Ticket
	User     models.User
	Messages []models.Message
}

func (s *SupportService) GetTicketDetails(ticketID uint) (*TicketDetails, error) {
	t, err := s.tickets.GetByID(ticketID)
	if err != nil {
		return nil, err
	}
	u, err := s.users.GetByID(t.UserID)
	if err != nil {
		return nil, err
	}
	msgs, _ := s.messages.ListRecentByUserID(t.UserID, 20)
	return &TicketDetails{
		Ticket:   *t,
		User:     *u,
		Messages: msgs,
	}, nil
}

func (s *SupportService) CloseTicket(ticketID uint) error {
	return s.tickets.UpdateStatus(ticketID, "closed")
}

func (s *SupportService) ParseTicketIDFromCommand(text string) (uint, bool) {
	parts := strings.Fields(strings.TrimSpace(text))
	if len(parts) < 2 {
		return 0, false
	}
	n, err := strconv.ParseUint(parts[1], 10, 64)
	if err != nil || n == 0 {
		return 0, false
	}
	return uint(n), true
}

func emptyAsDash(s string) string {
	if strings.TrimSpace(s) == "" {
		return "-"
	}
	return s
}

func previewText(s string, max int) string {
	s = strings.TrimSpace(s)
	s = strings.ReplaceAll(s, "\n", " ")
	if max <= 0 {
		max = 80
	}
	if len([]rune(s)) <= max {
		return s
	}
	r := []rune(s)
	return string(r[:max]) + "…"
}

