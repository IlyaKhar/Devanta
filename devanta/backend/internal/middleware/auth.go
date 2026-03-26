package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func JWTProtected(secret string, allowedRoles ...string) fiber.Handler {
	roleSet := map[string]bool{}
	for _, r := range allowedRoles {
		roleSet[r] = true
	}

	return func(c *fiber.Ctx) error {
		tokenHeader := c.Get("Authorization")
		if tokenHeader == "" {
			return fiber.NewError(fiber.StatusUnauthorized, "missing token")
		}

		tokenString := strings.TrimPrefix(tokenHeader, "Bearer ")
		tkn, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		})
		if err != nil || !tkn.Valid {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
		}

		claims, ok := tkn.Claims.(jwt.MapClaims)
		if !ok {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid claims")
		}

		role, _ := claims["role"].(string)
		if len(roleSet) > 0 && !roleSet[role] {
			return fiber.NewError(fiber.StatusForbidden, "forbidden")
		}

		c.Locals("userID", uint(claims["sub"].(float64)))
		c.Locals("role", role)
		return c.Next()
	}
}
