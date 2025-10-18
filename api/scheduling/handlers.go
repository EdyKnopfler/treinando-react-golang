package scheduling

import (
	_ "embed"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

//go:embed scheduling.json
var sample string

func GetById(c *gin.Context) {
	id := c.Param("id")
	username, _ := c.Get("username")
	permissions, _ := c.Get("permissions")

	fmt.Println(id)
	fmt.Println(username)
	fmt.Println(permissions)

	// c.JSON(http.StatusOK, gin.H{"status": "ok"})
	c.Data(http.StatusOK, "application/json; charset=utf-8", []byte(sample))
}
