package controllers

import (
	"APIvdgm/database"
	"APIvdgm/models"

	"github.com/gin-gonic/gin"
)

func GetUserByID(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	db := database.DB
	if result := db.Preload("Cart").First(&user, id); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "user not found"})
		return
	}
	c.IndentedJSON(200, user)
}
