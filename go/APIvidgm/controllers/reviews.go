package controllers

import (
	"APIvdgm/database"
	"APIvdgm/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ModStatus string

const (
	ReviewPending  ModStatus = "pending"
	ReviewApproved ModStatus = "approved"
	ReviewRejected ModStatus = "rejected"
)

func GetReviewsByVideogameID(c *gin.Context) {
	videogameID := c.Param("id")
	var videogame models.VideoGame
	db := database.DB
	if result := db.Preload("Reviews").First(&videogame, videogameID); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "videogame not found"})
		return
	}
	c.IndentedJSON(200, videogame.Reviews)
}

func UpdateReview(c *gin.Context) {
	id := c.Param("id")
	var newReview models.Review
	var oldReview models.Review
	if err := c.ShouldBindJSON(&newReview); err != nil {
		c.IndentedJSON(400, gin.H{"error": err.Error()})
		return
	}
	db := database.DB
	if result := db.First(&oldReview, id); result.Error != nil {
		c.IndentedJSON(404, gin.H{"error": "review not found"})
		return
	}
	newReview.ID = oldReview.ID
	newReview.UserID = oldReview.UserID
	newReview.VideoGameID = oldReview.VideoGameID
	if result := db.Save(&newReview); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	c.IndentedJSON(200, newReview)
}

func GetReviewByUserAndGame(c *gin.Context) {
	userID := c.Param("id")
	gameID := c.Param("gameID")
	var user models.User
	var review models.Review

	db := database.DB

	if result := db.First(&user, userID); result.Error != nil {
		c.IndentedJSON(404, gin.H{"error": "user not found"})
		return
	}
	if result := db.First(&models.VideoGame{}, gameID); result.Error != nil {
		c.IndentedJSON(404, gin.H{"error": "videogame not found"})
		return
	}
	if result := db.Where("user_id = ? AND video_game_id = ?", userID, gameID).First(&review); result.Error != nil {
		c.IndentedJSON(404, gin.H{"error": "review not found"})
		return
	}
	c.IndentedJSON(200, review)

}

func CreateOrUpdateReview(c *gin.Context) {
	gameID := c.Param("gameID")
	userID := c.Param("id")
	db := database.DB
	var review models.Review
	var oldReview models.Review
	var user models.User
	var game models.VideoGame

	if result := db.First(&game, gameID); result.Error != nil {
		c.IndentedJSON(404, gin.H{"error": "game not found"})
		return
	}
	if result := db.First(&user, userID); result.Error != nil {
		c.IndentedJSON(404, gin.H{"error": "user not found"})
		return
	}
	if err := c.ShouldBindJSON(&review); err != nil {
		c.IndentedJSON(500, gin.H{"error": err.Error()})
		return
	}
	result := db.Where("user_id = ? AND video_game_id = ?", userID, gameID).First(&oldReview)
	if result.Error == nil {
		review.ID = oldReview.ID
	}

	gid, _ := strconv.ParseUint(gameID, 10, 64)
	review.VideoGameID = uint(gid)
	review.UserID = user.ID
	review.ModStatus = string(ReviewPending)
	review.Username = user.Username
	review.VideoGameName = game.Title

	if result := db.Save(&review); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	c.IndentedJSON(200, review)

}

func GetReviewsByUser(c *gin.Context) {
	var user models.User
	db := database.DB
	userID := c.Param("id")

	if result := db.Preload("Reviews").First(&user, userID); result.Error != nil {
		c.IndentedJSON(404, gin.H{"error": "user not found"})
		return
	}
	c.IndentedJSON(200, user.Reviews)

}

func DeleteReview(c *gin.Context) {
	userID := c.Param("id")
	reviewID := c.Param("reviewID")
	db := database.DB

	var user models.User
	var review models.Review

	if result := db.First(&user, userID); result.Error != nil {
		c.IndentedJSON(404, gin.H{"error": "user not found"})
		return
	}
	if result := db.First(&review, reviewID); result.Error != nil {
		c.IndentedJSON(404, gin.H{"error": "review not found"})
		return
	}
	if review.UserID != user.ID {
		c.IndentedJSON(403, gin.H{"error": "review does not belong to user"})
		return
	}
	if result := db.Delete(&review); result.Error != nil {
		c.IndentedJSON(500, result.Error.Error())
		return
	}
	c.IndentedJSON(200, gin.H{"message": "ok"})
}
