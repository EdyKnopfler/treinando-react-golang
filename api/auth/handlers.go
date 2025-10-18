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

func setRefreshTokenCookie(refreshToken string, duration int, c *gin.Context) {
	domain := os.Getenv("COOKIE_DOMAIN")
	isDev := domain == "localhost"

	if isDev {
		domain = ""
	}

	if !isDev {
		c.SetSameSite(http.SameSiteNoneMode) // requires Secure
	}

	c.SetCookie(
		refreshTokenCookie,
		refreshToken,
		duration,
		"/",    // path
		domain, // domain (opcional)
		!isDev, // secure (HTTPS)
		true,   // httpOnly (no JS)
	)
}

func defineRefreshTokenCookie(refreshToken string, c *gin.Context) {
	setRefreshTokenCookie(refreshToken, int(RefreshTokenDuration.Seconds()), c)
}

func cleanRefreshTokenCookie(c *gin.Context) {
	setRefreshTokenCookie("", -1, c)
}

func loginProcess(username string, c *gin.Context) {
	permissions := "xxxx" // TODO vindo do DB
	accessToken, err := CreateAccessToken(username, permissions)

	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Erro ao autenticar"})
		return
	}

	refreshToken, err := CreateRefreshToken(username)

	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Erro ao autenticar"})
		return
	}

	defineRefreshTokenCookie(refreshToken, c)

	c.JSON(http.StatusOK, gin.H{
		"id":          1,
		"name":        "ZimTom Barriga y Pesado",
		"accessToken": accessToken,
	})
}

func Login(c *gin.Context) {
	var loginForm LoginForm

	if err := c.ShouldBindJSON(&loginForm); err != nil {
		// TODO err.Error() é algo que pode ir para um registro de erros, mas não FICAR EXPOSTO
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "JSON inválido"})
		return
	}

	if loginForm.Username == "ZimTom" && loginForm.Password == "GÔRDO" { // TODO vindo do DB
		loginProcess(loginForm.Username, c)
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário ou senha inválidos"})
	}
}

func Logout(c *gin.Context) {
	cleanRefreshTokenCookie(c)
	c.Status(http.StatusNoContent)
}

func Refresh(c *gin.Context) {
	refreshToken, err := c.Cookie(refreshTokenCookie)

	if err != nil {
		fmt.Println(err)
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Refresh token não encontrado"})
		return
	}

	claims, err := VerifyRefreshToken(refreshToken)

	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Refresh token inválido"})
		return
	}

	username, ok := claims["username"].(string)

	if !ok {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Refresh token inválido"})
		return
	}

	loginProcess(username, c)
}
