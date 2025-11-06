package controllers

import (
	"APIvdgm/database"
	"APIvdgm/models"
	"strings"

	"github.com/gin-gonic/gin"
)

func GetVideogames(c *gin.Context) {
	db := database.DB

	genre := c.Query("genre")
	platform := c.Query("platform")
	label := c.Query("label")
	priceMin := c.Query("price_min")
	priceMax := c.Query("price_max")

	var games []models.VideoGame
	query := db.Model(&models.VideoGame{}).Preload("Genre").Preload("Platform").Preload("Label")

	if genre != "" {
		genres := strings.Split(genre, ",")
		query = query.Joins("JOIN video_game_genres ON video_games.id = video_game_genres.video_game_id").
			Joins("JOIN genres ON genres.id = video_game_genres.genre_id").
			Where("genres.name IN ?", genres)
	}

	if platform != "" {
		platforms := strings.Split(platform, ",")
		query = query.Joins("JOIN video_game_platforms ON video_games.id = video_game_platforms.video_game_id").
			Joins("JOIN platforms ON platforms.id = video_game_platforms.platform_id").
			Where("platforms.name IN ?", platforms)
	}

	if label != "" {
		labels := strings.Split(label, ",")
		query = query.Joins("JOIN video_game_labels ON video_games.id = video_game_labels.video_game_id").
			Joins("JOIN labels ON labels.id = video_game_labels.label_id").
			Where("labels.name IN ?", labels)
	}

	if priceMin != "" {
		query = query.Where("price >= ?", priceMin)
	}

	if priceMax != "" {
		query = query.Where("price <= ?", priceMax)
	}

	if err := query.Find(&games).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, games)

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
