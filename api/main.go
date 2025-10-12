package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"com.derso/treino-api/auth"
	"com.derso/treino-api/scheduling"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	router.POST("/login", auth.Login)
	router.POST("/refresh", auth.Refresh)
	router.GET("/scheduling/:id", auth.AuthMiddleware, scheduling.GetById)

	srv := &http.Server{
		Addr:    ":8080",
		Handler: router,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Println("Erro ao criar servidor")
			panic(err)
		}
	}()

	stop := make(chan os.Signal)
	signal.Notify(stop, syscall.SIGTERM, syscall.SIGINT, os.Interrupt) // os.Interrupt: Ctrl+C
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	fmt.Println("Parando...")

	if err := srv.Shutdown(ctx); err != nil {
		fmt.Println("Erro ao encerrar servidor:", err)
	}

	select {
	case <-ctx.Done():
		fmt.Println("Servidor encerrado")
	}
}
