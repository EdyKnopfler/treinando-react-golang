package auth_test

import (
	"net/http"
	"testing"

	"com.derso/treino-api/router"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/suite"
)

type AuthSuite struct {
	router *gin.Engine
	suite.Suite
}

func (suite *AuthSuite) SetupSuite() {
	suite.router = router.SetupRouter()
}

func (suite *AuthSuite) TestValidCredentials() {
	// Façamos de conta que no SetupSuite alimentamos um banco de dados
	validCredentials := map[string]string{
		"username": "ZimTom",
		"password": "GÔRDO",
	}

	recorder := router.JSONRequest(suite.router, "POST", "/login", validCredentials, nil)
	suite.Equal(http.StatusOK, recorder.Code)

	var result map[string]any
	router.ParseJSONResponse(&suite.Suite, recorder, &result)
	token, ok := result["accessToken"]
	suite.True(ok, "accessToken presente na resposta")
	suite.NotEmpty(token, "accessToken não é vazio")
}

func (suite *AuthSuite) TestInvalidCredentials() {
	invalidCredentials := map[string]string{
		"username": "XXXXX",
		"password": "YYYYY",
	}

	recorder := router.JSONRequest(suite.router, "POST", "/login", invalidCredentials, nil)
	suite.Equal(http.StatusUnauthorized, recorder.Code)

	var result map[string]any
	router.ParseJSONResponse(&suite.Suite, recorder, &result)
	_, ok := result["accessToken"]
	suite.False(ok, "accessToken não deve estar presente na resposta")
}

func TestAuth(t *testing.T) {
	suite.Run(t, new(AuthSuite))
}
