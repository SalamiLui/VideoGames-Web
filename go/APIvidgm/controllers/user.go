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

func DeleteDirection(c *gin.Context) {
	db := database.DB
	dirID := c.Param("dirID")

	var dir models.Direction

	if result := db.First(&dir, dirID); result.Error != nil {
		c.IndentedJSON(400, gin.H{"error": "direction not found"})
		return
	}

	if result := db.Delete(&dir); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	c.IndentedJSON(200, gin.H{"message": "direction deleted"})

}

func GetDirectionByID(c *gin.Context) {
	db := database.DB
	dirID := c.Param("dirID")

	var dir models.Direction

	if result := db.First(&dir, dirID); result.Error != nil {
		c.IndentedJSON(400, gin.H{"error": "direction not found"})
		return
	}

	c.IndentedJSON(200, dir)

}

func ChangeDirection(c *gin.Context) {
	db := database.DB
	dirID := c.Param("dirID")
	UserID := c.Param("id")

	var dir models.Direction
	var user models.User
	var newDir models.Direction

	if result := db.First(&user, UserID); result.Error != nil {
		c.IndentedJSON(400, gin.H{"error": "user not found"})
		return
	}

	if result := db.First(&dir, dirID); result.Error != nil {
		c.IndentedJSON(400, gin.H{"error": "direction not found"})
		return
	}

	if err := c.ShouldBindJSON(&newDir); err != nil {
		c.IndentedJSON(500, gin.H{"error": err.Error()})
		return
	}
	newDir.ID = dir.ID
	newDir.UserID = dir.UserID

	if result := db.Save(&newDir); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}

	c.IndentedJSON(200, nil)

}
