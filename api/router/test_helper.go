package router

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/suite"
)

func JSONRequest(
	r *gin.Engine,
	method string,
	path string,
	body any,
	headers map[string]string,
) *httptest.ResponseRecorder {
	recorder := httptest.NewRecorder()

	var reqBody io.Reader
	if body != nil {
		jsonBytes, _ := json.Marshal(body)
		reqBody = bytes.NewBuffer(jsonBytes)
	}

	request, _ := http.NewRequest(method, path, reqBody)
	request.Header.Set("Content-Type", "application/json")

	for k, v := range headers {
		request.Header.Set(k, v)
	}

	r.ServeHTTP(recorder, request)
	return recorder
}

func ParseJSONResponse(suite *suite.Suite, recorder *httptest.ResponseRecorder, result any) {
	err := json.Unmarshal(recorder.Body.Bytes(), &result)
	suite.Require().NoError(err, "Devolvido JSON inválido")
}
