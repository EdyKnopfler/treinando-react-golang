package scheduling_test

import (
	"net/http"
	"testing"

	"com.derso/treino-api/auth"
	"com.derso/treino-api/router"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/suite"
)

type SchedulingSuite struct {
	router *gin.Engine
	suite.Suite
}

func (suite *SchedulingSuite) SetupSuite() {
	suite.router = router.SetupRouter()
}

func (suite *SchedulingSuite) TestNotAuthenticatedAccess() {
	recorder := router.JSONRequest(suite.router, "GET", "/scheduling/id_bobo", nil, nil)
	suite.Equal(http.StatusUnauthorized, recorder.Code)

	var result map[string]string
	router.ParseJSONResponse(&suite.Suite, recorder, &result)
	_, ok := result["error"]
	suite.True(ok, "error deve estar presente na resposta")
}

func (suite *SchedulingSuite) TestAuthenticatedAccess() {
	token, _ := auth.CreateAccessToken("coiso", "")

	recorder := router.JSONRequest(suite.router, "GET", "/scheduling/id_bobo", nil, map[string]string{
		"Authorization": "Bearer " + token,
	})

	suite.Equal(http.StatusOK, recorder.Code)

	var result any
	router.ParseJSONResponse(&suite.Suite, recorder, &result)
	_, ok := result.([]any)
	suite.True(ok, "a resposta deve ser um array")
}

func TestAuth(t *testing.T) {
	suite.Run(t, new(SchedulingSuite))
}
