package auth

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")

	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token não fornecido"})
		return
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Formato inválido do header Authorization"})
		return
	}

	tokenString := parts[1]

	claims, err := VerifyAccessToken(tokenString)

	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Token inválido ou expirado"})
		return
	}

	username, _ := claims["username"].(string)
	permissions, ok := claims["permissions"].(string)

	if !ok {
		permissions = ""
	}

	c.Set("username", username)
	c.Set("permissions", permissions)

	c.Next()
}
