package controllers

import (
	"APIvdgm/database"
	"APIvdgm/models"

	"github.com/gin-gonic/gin"
)

func GetVideogames(c *gin.Context) {
	var videogames []models.VideoGame
	db := database.DB
	db.Find(&videogames)
	c.IndentedJSON(200, videogames)
}

func GetVideogameByID(c *gin.Context) {
	id := c.Param("id")
	var videogame models.VideoGame
	db := database.DB
	if result := db.Preload("Genre").Preload("Platform").Preload("Label").Preload("Reviews").First(&videogame, id); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "videogame not found"})
		return
	}
	c.IndentedJSON(200, videogame)
}

func CreateVideogame(c *gin.Context) {
	var videogame models.VideoGame
	if err := c.ShouldBindJSON(&videogame); err != nil {
		c.IndentedJSON(400, gin.H{"error": err.Error()})
		return
	}
	db := database.DB
	if result := db.Create(&videogame); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	c.IndentedJSON(201, videogame)
}

func DeleteVideogame(c *gin.Context) {
	id := c.Param("id")
	var videogame models.VideoGame
	db := database.DB
	if result := db.Delete(&videogame, id); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	c.IndentedJSON(200, gin.H{"message": "videogame deleted"})
}

func UpdateVideogame(c *gin.Context) {
	id := c.Param("id")
	var newVideogame models.VideoGame
	var oldVideogame models.VideoGame
	if err := c.ShouldBindJSON(&newVideogame); err != nil {
		c.IndentedJSON(400, gin.H{"error": err.Error()})
		return
	}
	db := database.DB
	if result := db.First(&oldVideogame, id); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "videogame not found"})
		return
	}
	newVideogame.ID = oldVideogame.ID
	if result := db.Save(&newVideogame); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	c.IndentedJSON(200, newVideogame)

}
