package auth

import (
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const AccessTokenDuration = time.Minute * 1
const RefreshTokenDuration = time.Minute * 10

var accessTokenSecret = os.Getenv("JWT_SECRET")
var refreshTokenSecret = os.Getenv("REFRESH_SECRET")

func CreateAccessToken(username string, permissions string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username":    username,
		"permissions": permissions,
		"exp":         time.Now().Add(AccessTokenDuration).Unix(),
	})

	tokenString, err := token.SignedString([]byte(accessTokenSecret))

	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func CreateRefreshToken(username string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": username,
		"exp":      time.Now().Add(RefreshTokenDuration).Unix(),
	})

	tokenString, err := token.SignedString([]byte(refreshTokenSecret))

	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func verifyToken(tokenString string, secret string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("Token inválido")
	}

	claims, ok := token.Claims.(jwt.MapClaims)

	if !ok {
		return nil, fmt.Errorf("Token inválido")
	}

	_, ok = claims["username"].(string)

	if !ok {
		return nil, fmt.Errorf("Token inválido")
	}

	return claims, nil
}

func VerifyAccessToken(tokenString string) (jwt.MapClaims, error) {
	return verifyToken(tokenString, accessTokenSecret)
}

func VerifyRefreshToken(tokenString string) (jwt.MapClaims, error) {
	return verifyToken(tokenString, refreshTokenSecret)
}
