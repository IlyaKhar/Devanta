package bot

import tele "gopkg.in/telebot.v3"

type Menu struct {
	Main *tele.ReplyMarkup

	BtnFAQ         tele.Btn
	BtnAbout       tele.Btn
	BtnChatAdmin   tele.Btn
	BtnCreateTicket tele.Btn
	BtnBack        tele.Btn
}

func NewMenu() *Menu {
	m := &Menu{Main: &tele.ReplyMarkup{ResizeKeyboard: true}}

	m.BtnFAQ = m.Main.Text("❓ FAQ")
	m.BtnAbout = m.Main.Text("ℹ️ О нас")
	m.BtnChatAdmin = m.Main.Text("📞 Связь с администратором")
	m.BtnCreateTicket = m.Main.Text("📝 Оставить обращение")
	m.BtnBack = m.Main.Text("🔙 Назад")

	m.Main.Reply(
		m.Main.Row(m.BtnFAQ, m.BtnAbout),
		m.Main.Row(m.BtnChatAdmin),
		m.Main.Row(m.BtnCreateTicket),
	)

	return m
}

