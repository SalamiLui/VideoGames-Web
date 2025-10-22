package controllers

import (
	"APIvdgm/database"
	"APIvdgm/models"

	"github.com/gin-gonic/gin"
)

type ModStatus string

const (
	ReviewPending  ModStatus = "pending"
	ReviewApproved ModStatus = "approved"
	ReviewRejected ModStatus = "rejected"
)

func CreateReview(c *gin.Context) {
	db := database.DB
	var review models.Review
	if err := c.ShouldBindJSON(&review); err != nil {
		c.IndentedJSON(400, gin.H{"error": err.Error()})
		return
	}
	userID := c.Param("uid")
	var user models.User
	var videogame models.VideoGame
	videogameID := c.Param("id")
	if result := db.First(&user, userID); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "user not found"})
		return
	}
	if result := db.First(&videogame, videogameID); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "videogame not found"})
		return
	}
	review.UserID = user.ID
	review.VideoGameID = videogame.ID
	review.ModStatus = string(ReviewPending)
	if result := db.Create(&review); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	c.IndentedJSON(200, review)
}

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
		c.IndentedJSON(404, gin.H{"message": "review not found"})
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
