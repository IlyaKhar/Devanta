package models

import "time"

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Email     string    `gorm:"uniqueIndex;not null" json:"email"`
	Password  string    `gorm:"not null" json:"-"`
	Role      string    `gorm:"type:varchar(20);default:student" json:"role"`
	Age       int       `json:"age"`
	Blocked   bool      `gorm:"default:false" json:"blocked"`
	CreatedAt time.Time `json:"createdAt"`
}

type Module struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Title     string    `json:"title"`
	SortOrder int       `json:"sortOrder"`
	CreatedAt time.Time `json:"createdAt"`
}

type Lesson struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ModuleID  uint      `json:"moduleId"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	SortOrder int       `json:"sortOrder"`
	CreatedAt time.Time `json:"createdAt"`
}

type Task struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	LessonID   uint      `json:"lessonId"`
	Title      string    `json:"title"`
	Type       string    `json:"type"`
	Question   string    `json:"question"`
	AnswerKey  string    `json:"-"`
	XPReward   int       `json:"xpReward"`
	CreatedAt  time.Time `json:"createdAt"`
}

type QuizQuestion struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	ModuleID   uint      `json:"moduleId"`
	Question   string    `json:"question"`
	Options    string    `json:"options"`
	CorrectIdx int       `json:"-"`
	CreatedAt  time.Time `json:"createdAt"`
}

type UserProgress struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"userId"`
	LessonID  uint      `json:"lessonId"`
	Status    string    `gorm:"default:in_progress" json:"status"`
	Score     int       `json:"score"`
	CreatedAt time.Time `json:"createdAt"`
}

type XPEvent struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"userId"`
	Source    string    `json:"source"`
	XPDelta   int       `json:"xpDelta"`
	CreatedAt time.Time `json:"createdAt"`
}

type Achievement struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Code      string    `gorm:"uniqueIndex" json:"code"`
	Title     string    `json:"title"`
	CreatedAt time.Time `json:"createdAt"`
}

type UserAchievement struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	UserID        uint      `json:"userId"`
	AchievementID uint      `json:"achievementId"`
	CreatedAt     time.Time `json:"createdAt"`
}

type Review struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `json:"userId"`
	Text        string    `json:"text"`
	Rating      int       `json:"rating"`
	Status      string    `gorm:"default:pending" json:"status"`
	RejectReason string   `json:"rejectReason"`
	CreatedAt   time.Time `json:"createdAt"`
}

type ModerationLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ReviewID  uint      `json:"reviewId"`
	ActorID   uint      `json:"actorId"`
	Action    string    `json:"action"`
	Comment   string    `json:"comment"`
	CreatedAt time.Time `json:"createdAt"`
}

type AILog struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `json:"userId"`
	Mode       string    `json:"mode"`
	PromptHash string    `json:"promptHash"`
	LatencyMS  int       `json:"latencyMs"`
	CreatedAt  time.Time `json:"createdAt"`
}
