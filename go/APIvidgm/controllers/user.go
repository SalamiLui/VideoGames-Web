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

func GetUserDirections(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	db := database.DB
	if result := db.Preload("Directions").First(&user, id); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "user not found"})
		return
	}
	c.IndentedJSON(200, user.Directions)

}

func NewUserDirection(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	var direction models.Direction

	if err := c.ShouldBindJSON(&direction); err != nil {
		c.IndentedJSON(500, gin.H{"error": err.Error()})
		return
	}

	db := database.DB
	if result := db.Preload("Directions").First(&user, id); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "user not found"})
		return
	}
	if err := db.Model(&user).Association("Directions").Append(&direction); err != nil {
		c.IndentedJSON(500, gin.H{"error": err.Error()})
		return
	}
	if result := db.Save(user); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}

	c.IndentedJSON(200, direction)
}
