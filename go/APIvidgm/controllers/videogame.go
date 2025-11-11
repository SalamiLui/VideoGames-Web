package controllers

import (
	"APIvdgm/database"
	"APIvdgm/middleware"
	"APIvdgm/models"
	"APIvdgm/roles"
	"strings"

	"github.com/gin-gonic/gin"
)

// GetVideogames godoc
// @Summary Retrieve videogames with optional filters
// @Description Retrieves a list of videogames, optionally filtered by genre, platform, label, and price range. Supports multiple comma-separated values for genre, platform, and label.
// @Tags Videogames
// @Accept json
// @Produce json
// @Param genre query string false "Comma-separated list of genres to filter"
// @Param platform query string false "Comma-separated list of platforms to filter"
// @Param label query string false "Comma-separated list of labels to filter"
// @Param price_min query number false "Minimum price filter"
// @Param price_max query number false "Maximum price filter"
// @Success 200 {array} models.VideoGame "List of videogames matching filters"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /videogames [get]
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

// GetVideogameByID godoc
// @Summary Retrieve a videogame by ID
// @Description Retrieves detailed information about a specific videogame, including genres, platforms, labels, and reviews.
// @Tags Videogames
// @Accept json
// @Produce json
// @Param id path int true "Videogame ID"
// @Success 200 {object} models.VideoGame "Videogame details"
// @Failure 404 {object} map[string]string "Videogame not found"
// @Router /videogames/{id} [get]
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

// CreateVideogame godoc
// @Summary Create a new video game
// @Description Creates a new video game entry including its genres, platforms, and labels.
// @Tags Videogames
// @Accept json
// @Produce json
// @Param videogame body models.VideoGame true "Video game data"
// @Success 201 {object} models.VideoGame
// @Failure 400 {object} map[string]string "Invalid request body"
// @Failure 403 {object} map[string]string "Unauthorized or insufficient permissions"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /videogames [post]
func CreateVideogame(c *gin.Context) {
	if err := middleware.CheckAuthExpectedMinRole(c, roles.Admin); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
		return
	}
	var videogame models.VideoGame
	if err := c.ShouldBindJSON(&videogame); err != nil {
		c.IndentedJSON(400, gin.H{"error": err.Error()})
		return
	}
	videogame.Rating = 0
	videogame.DigStock = 0
	videogame.Reviews = nil
	videogame.SumRating = 0

	db := database.DB
	if result := db.Create(&videogame); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	c.IndentedJSON(201, videogame)
}

// DeleteVideogame godoc
// @Summary Delete a video game
// @Description Deletes a video game by its ID. Requires admin privileges.
// @Tags Videogames
// @Accept json
// @Produce json
// @Param id path int true "Video game ID"
// @Success 200 {object} map[string]string "Video game deleted successfully"
// @Failure 403 {object} map[string]string "Unauthorized or insufficient permissions"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /videogames/{id} [delete]
func DeleteVideogame(c *gin.Context) {
	if err := middleware.CheckAuthExpectedMinRole(c, roles.Admin); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
		return
	}
	id := c.Param("id")
	var videogame models.VideoGame
	db := database.DB
	if result := db.Delete(&videogame, id); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	c.IndentedJSON(200, gin.H{"message": "videogame deleted"})
}

// UpdateVideogame godoc
// @Summary Update an existing video game
// @Description Updates a video game by its ID, replacing its information and many-to-many relationships. Requires admin privileges.
// @Tags Videogames
// @Accept json
// @Produce json
// @Param id path int true "Video game ID"
// @Param videogame body models.VideoGame true "Updated video game data"
// @Success 200 {object} models.VideoGame
// @Failure 400 {object} map[string]string "Invalid request body"
// @Failure 403 {object} map[string]string "Unauthorized or insufficient permissions"
// @Failure 404 {object} map[string]string "Video game not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /videogames/{id} [put]
func UpdateVideogame(c *gin.Context) {
	if err := middleware.CheckAuthExpectedMinRole(c, roles.Admin); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
		return
	}
	id := c.Param("id")
	var newVideogame models.VideoGame
	var oldVideogame models.VideoGame
	if err := c.ShouldBindJSON(&newVideogame); err != nil {
		c.IndentedJSON(400, gin.H{"error": err.Error()})
		return
	}
	db := database.DB
	if result := db.Preload("Genre").Preload("Platform").Preload("Label").First(&oldVideogame, id); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "videogame not found"})
		return
	}
	newVideogame.ID = oldVideogame.ID
	newVideogame.Rating = oldVideogame.Rating
	newVideogame.DigStock = oldVideogame.DigStock
	newVideogame.SumRating = oldVideogame.SumRating

	// TODO add transanction to roollback
	if result := db.Save(&newVideogame); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	if err := db.Model(&oldVideogame).Association("Genre").Replace(newVideogame.Genre); err != nil {
		c.IndentedJSON(500, gin.H{"error": err.Error()})
		return
	}
	if err := db.Model(&oldVideogame).Association("Platform").Replace(newVideogame.Platform); err != nil {
		c.IndentedJSON(500, gin.H{"error": err.Error()})
		return
	}
	if err := db.Model(&oldVideogame).Association("Label").Replace(newVideogame.Label); err != nil {
		c.IndentedJSON(500, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(200, newVideogame)

}
