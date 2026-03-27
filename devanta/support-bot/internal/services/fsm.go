package services

import "sync"

type UserMode string

const (
	UserModeDefault       UserMode = "default"
	UserModeChatToAdmin   UserMode = "chat_to_admin"
	UserModeCreatingTicket UserMode = "creating_ticket"
)

type FSM struct {
	mu    sync.RWMutex
	modes map[int64]UserMode
}

func NewFSM() *FSM {
	return &FSM{
		modes: map[int64]UserMode{},
	}
}

func (f *FSM) Get(userTelegramID int64) UserMode {
	f.mu.RLock()
	defer f.mu.RUnlock()
	if v, ok := f.modes[userTelegramID]; ok {
		return v
	}
	return UserModeDefault
}

func (f *FSM) Set(userTelegramID int64, mode UserMode) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.modes[userTelegramID] = mode
}

func (f *FSM) Reset(userTelegramID int64) {
	f.mu.Lock()
	defer f.mu.Unlock()
	delete(f.modes, userTelegramID)
}

