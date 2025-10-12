package scheduling

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetById(c *gin.Context) {
	id := c.Param("id")
	username, _ := c.Get("username")
	permissions, _ := c.Get("permissions")

	fmt.Println(id)
	fmt.Println(username)
	fmt.Println(permissions)

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
