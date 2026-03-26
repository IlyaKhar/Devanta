package services

import (
	"errors"
	"time"

	"devanta/backend/internal/models"
	"devanta/backend/internal/repositories"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	secret   string
	userRepo *repositories.UserRepository
}

func NewAuthService(secret string, userRepo *repositories.UserRepository) *AuthService {
	return &AuthService{secret: secret, userRepo: userRepo}
}

func (s *AuthService) Register(email, password string, age int) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	return s.userRepo.Create(&models.User{
		Email:    email,
		Password: string(hash),
		Role:     "student",
		Age:      age,
	})
}

func (s *AuthService) Login(email, password string) (string, error) {
	user, err := s.userRepo.GetByEmail(email)
	if err != nil {
		return "", err
	}
	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)) != nil {
		return "", errors.New("invalid credentials")
	}
	claims := jwt.MapClaims{
		"sub":  user.ID,
		"role": user.Role,
		"exp":  time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.secret))
}
