package auth

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

const refreshTokenCookie = "refresh_token"

type LoginForm struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func setRefreshTokenCookie(refreshToken string, c *gin.Context) {
	c.SetCookie(
		refreshTokenCookie,
		refreshToken,
		int(RefreshTokenDuration.Seconds()),
		"/",                 // path
		os.Getenv("DOMAIN"), // domain (opcional)
		true,                // secure (HTTPS)
		true,                // httpOnly (no JS)
	)
}

func Login(c *gin.Context) {
	var loginForm LoginForm

	if err := c.ShouldBindJSON(&loginForm); err != nil {
		// TODO err.Error() é algo que pode ir para um registro de erros, mas não FICAR EXPOSTO
		c.JSON(http.StatusBadRequest, gin.H{"error": "JSON inválido"})
		return
	}

	if loginForm.Username == "ZimTom" && loginForm.Password == "GÔRDO" { // TODO vindo do DB
		permissions := "xxxx" // TODO vindo do DB
		accessToken, err := CreateAccessToken(loginForm.Username, permissions)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao autenticar"})
			return
		}

		refreshToken, err := CreateRefreshToken(loginForm.Username)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao autenticar"})
			return
		}

		setRefreshTokenCookie(refreshToken, c)

		c.JSON(http.StatusOK, gin.H{
			"id":          1,
			"name":        "ZimTom Barriga y Pesado",
			"accessToken": accessToken,
		})

		return
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário ou senha inválidos"})
	}
}

func Logout(c *gin.Context) {
	c.SetCookie(
		refreshTokenCookie,
		"",
		-1,
		"/",
		os.Getenv("DOMAIN"),
		true, // secure (HTTPS)
		true, // httpOnly (no JS)
	)

	c.Status(http.StatusNoContent)
}

func Refresh(c *gin.Context) {
	refreshToken, err := c.Cookie(refreshTokenCookie)

	if err != nil {
		fmt.Println(err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token não encontrado"})
		return
	}

	claims, err := VerifyRefreshToken(refreshToken)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token inválido"})
		return
	}

	username, _ := claims["username"].(string)

	newRefreshToken, err := CreateRefreshToken(username)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Erro ao gerar refresh token"})
		return
	}

	setRefreshTokenCookie(newRefreshToken, c)

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
