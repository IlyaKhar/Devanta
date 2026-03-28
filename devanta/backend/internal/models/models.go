package models

import "time"

type User struct {
	ID                 uint      `gorm:"primaryKey" json:"id"`
	Email              string    `gorm:"uniqueIndex;not null" json:"email"`
	// TelegramID - опционально (веб-регистрация без Telegram); NULL = не привязан.
	TelegramID         *int64    `gorm:"uniqueIndex" json:"telegramId,omitempty"`
	Password           string    `gorm:"not null" json:"-"`
	Role               string    `gorm:"type:varchar(20);default:student" json:"role"`
	Age                int       `json:"age"`
	FullName           string    `gorm:"default:''" json:"fullName"`
	Username           string    `gorm:"default:''" json:"username"`
	Bio                string    `gorm:"type:text;default:''" json:"bio"`
	AvatarURL          string    `gorm:"default:''" json:"avatarUrl"`
	EmailNotifications bool      `gorm:"default:true" json:"emailNotifications"`
	PushNotifications  bool      `gorm:"default:true" json:"pushNotifications"`
	Blocked            bool      `gorm:"default:false" json:"blocked"`
	// Coins — внутриигровая валюта за задачи и спецчелленджи (начисление на бэкенде).
	Coins              int       `gorm:"default:0" json:"coins"`
	CreatedAt          time.Time `json:"createdAt"`
}

type Module struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	Title          string    `json:"title"`
	SortOrder      int       `json:"sortOrder"`
	DurationMonths int       `gorm:"default:0" json:"durationMonths"`
	Students       int       `gorm:"default:0" json:"students"`
	Rating         float64   `gorm:"default:0" json:"rating"`
	Level          string    `gorm:"default:''" json:"level"`
	CreatedAt      time.Time `json:"createdAt"`
}

type Lesson struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ModuleID  uint      `json:"moduleId"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	VideoURL  string    `gorm:"default:''" json:"videoUrl"`
	SortOrder int       `json:"sortOrder"`
	CreatedAt time.Time `json:"createdAt"`
}

type Task struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	LessonID    uint      `json:"lessonId"`
	Title       string    `json:"title"`
	Type        string    `json:"type"` // basics | code | …
	Question    string    `json:"question"`
	AnswerKey   string    `json:"-"` // служебно / legacy
	Language    string    `gorm:"default:'javascript'" json:"-"`
	StarterCode string    `gorm:"type:text;default:''" json:"-"`
	HintsJSON   string    `gorm:"type:text;column:hints_json;default:''" json:"-"`   // ["подсказка1",…]
	ChecksJSON  string    `gorm:"type:text;column:checks_json;default:''" json:"-"` // ["f(1)===1",…] только на сервере
	XPReward    int       `json:"xpReward"`
	CreatedAt   time.Time `json:"createdAt"`
}

// SpecialChallenge - ежедневные/недельные челленджи (витрина на странице «Задачи»).
// UserChallengeClaim — пользователь один раз забрал награду за спецчеллендж по code.
type UserChallengeClaim struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"uniqueIndex:uq_user_challenge_claim;not null" json:"userId"`
	Code      string    `gorm:"size:64;uniqueIndex:uq_user_challenge_claim;not null" json:"code"`
	CreatedAt time.Time `json:"createdAt"`
}

type SpecialChallenge struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Code        string    `gorm:"uniqueIndex;not null" json:"code"`
	Title       string    `gorm:"not null" json:"title"`
	Description string    `gorm:"not null" json:"description"`
	RewardXP    int       `gorm:"not null" json:"rewardXp"`
	Duration    string    `gorm:"not null" json:"duration"`
	SortOrder   int       `gorm:"not null;default:0" json:"sortOrder"`
	CreatedAt   time.Time `json:"createdAt"`
}

// FAQEntry - запись для страницы FAQ.
type FAQEntry struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Category  string    `gorm:"index;not null" json:"category"`
	Question  string    `gorm:"not null" json:"question"`
	Answer    string    `gorm:"type:text;not null" json:"answer"`
	SortOrder int       `gorm:"not null;default:0" json:"sortOrder"`
	CreatedAt time.Time `json:"createdAt"`
}

type QuizQuestion struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	ModuleID      uint      `json:"moduleId"`
	BlockIndex    int       `gorm:"index;not null;default:1" json:"-"`    // блок 1..11
	LessonInBlock int       `gorm:"index;not null;default:1" json:"-"`    // урок внутри блока 1..3 (в блоке 11 всегда 1)
	Question      string    `json:"question"`
	Options       string    `json:"options"`
	CorrectIdx    int       `json:"-"`
	CreatedAt     time.Time `json:"createdAt"`
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
	ID           uint      `gorm:"primaryKey" json:"id"`
	UserID       uint      `json:"userId"`
	Text         string    `json:"text"`
	Rating       int       `json:"rating"`
	Status       string    `gorm:"default:pending" json:"status"`
	RejectReason string    `json:"rejectReason"`
	CreatedAt    time.Time `json:"createdAt"`
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

type BlockQuizResult struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	UserID        uint      `gorm:"uniqueIndex:uq_block_quiz_slot" json:"userId"`
	ModuleID      uint      `gorm:"uniqueIndex:uq_block_quiz_slot" json:"moduleId"`
	BlockIndex    int       `gorm:"uniqueIndex:uq_block_quiz_slot" json:"blockIndex"`
	LessonInBlock int       `gorm:"not null;default:1;uniqueIndex:uq_block_quiz_slot" json:"lessonInBlock"`
	ScorePercent  int       `json:"scorePercent"`
	Passed        bool      `gorm:"default:false" json:"passed"`
	Attempts      int       `gorm:"default:0" json:"attempts"`
	UpdatedAt     time.Time `json:"updatedAt"`
	CreatedAt     time.Time `json:"createdAt"`
}

// ParentConnection — связь ученик ↔ родитель (оба зарегистрированы; пара student+parent уникальна).
type ParentConnection struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	StudentUserID uint      `gorm:"not null;uniqueIndex:idx_parent_student_pair" json:"studentUserId"`
	ParentUserID  uint      `gorm:"not null;uniqueIndex:idx_parent_student_pair" json:"parentUserId"`
	CreatedAt     time.Time `json:"createdAt"`
}
