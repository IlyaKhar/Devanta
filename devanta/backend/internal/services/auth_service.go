package services

import (
	"errors"
	"time"

	"devanta/backend/internal/models"
	"devanta/backend/internal/repositories"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthTokens struct {
	AccessToken  string
	RefreshToken string
}

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

// RegisterParent — только аккаунт родителя (без уроков/курсов).
func (s *AuthService) RegisterParent(email, password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	return s.userRepo.Create(&models.User{
		Email:    email,
		Password: string(hash),
		Role:     "parent",
		Age:      0,
	})
}

func (s *AuthService) Login(email, password string) (AuthTokens, error) {
	user, err := s.userRepo.GetByEmail(email)
	if err != nil {
		// Нет пользователя - тот же ответ, что и при неверном пароле (без утечки факта регистрации).
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return AuthTokens{}, errors.New("invalid credentials")
		}
		return AuthTokens{}, err
	}
	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)) != nil {
		return AuthTokens{}, errors.New("invalid credentials")
	}
	if user.Blocked {
		return AuthTokens{}, errors.New("account disabled")
	}

	accessToken, err := s.generateAccessToken(user.ID, user.Role)
	if err != nil {
		return AuthTokens{}, err
	}
	refreshToken, err := s.generateRefreshToken(user.ID, user.Role)
	if err != nil {
		return AuthTokens{}, err
	}
	return AuthTokens{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *AuthService) Refresh(refreshToken string) (string, error) {
	claims, err := s.parseToken(refreshToken)
	if err != nil {
		return "", err
	}

	tokenType, _ := claims["typ"].(string)
	if tokenType != "refresh" {
		return "", errors.New("invalid token type")
	}
	subFloat, ok := claims["sub"].(float64)
	if !ok {
		return "", errors.New("invalid token payload")
	}
	userID := uint(subFloat)
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return "", errors.New("invalid token")
	}
	if user.Blocked {
		return "", errors.New("account disabled")
	}

	return s.generateAccessToken(userID, user.Role)
}

func (s *AuthService) generateAccessToken(userID uint, role string) (string, error) {
	claims := jwt.MapClaims{
		"sub":  userID,
		"role": role,
		"typ":  "access",
		"exp":  time.Now().Add(15 * time.Minute).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.secret))
}

func (s *AuthService) generateRefreshToken(userID uint, role string) (string, error) {
	claims := jwt.MapClaims{
		"sub":  userID,
		"role": role,
		"typ":  "refresh",
		"exp":  time.Now().Add(7 * 24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.secret))
}

func (s *AuthService) parseToken(tokenString string) (jwt.MapClaims, error) {
	tkn, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.secret), nil
	})
	if err != nil || !tkn.Valid {
		return nil, errors.New("invalid token")
	}
	claims, ok := tkn.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid claims")
	}
	return claims, nil
}
