package router

import (
	"com.derso/treino-api/auth"
	"com.derso/treino-api/lib"
	"com.derso/treino-api/scheduling"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	router := gin.Default()

	router.Use(lib.CORSMiddleware)

	router.POST("/login", auth.Login)
	router.POST("/logout", auth.Logout)
	router.POST("/refresh", auth.Refresh)
	router.GET("/scheduling/:id", auth.AuthMiddleware, scheduling.GetById)

	return router
}
