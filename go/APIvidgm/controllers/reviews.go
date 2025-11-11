package controllers

import (
	"APIvdgm/database"
	"APIvdgm/middleware"
	"APIvdgm/models"
	"APIvdgm/roles"
	"fmt"
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
	if err := middleware.CheckAuthExpectedUser(c, user.ID); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
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
	if err := middleware.CheckAuthExpectedUser(c, user.ID); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
		return
	}
	if err := c.ShouldBindJSON(&review); err != nil {
		c.IndentedJSON(500, gin.H{"error": err.Error()})
		return
	}
	rating2sum := review.Rating
	result := db.Where("user_id = ? AND video_game_id = ?", userID, gameID).First(&oldReview)
	if result.Error == nil {
		review.ID = oldReview.ID
		rating2sum -= oldReview.Rating
	}

	gid, _ := strconv.ParseUint(gameID, 10, 64)
	review.VideoGameID = uint(gid)
	review.UserID = user.ID
	review.ModStatus = string(ReviewPending)
	review.Username = user.Username
	review.VideoGameName = game.Title

	// TODO transaction to rollback

	if result := db.Save(&review); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	cnt := db.Model(&game).Association("Reviews").Count()
	game.SumRating += int64(rating2sum)
	game.Rating = float64(game.SumRating) / float64(cnt)
	if result := db.Save(&game); result.Error != nil {
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
	if err := middleware.CheckAuthExpectedUser(c, user.ID); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
		return
	}
	if err := middleware.CheckAuthExpectedUser(c, user.ID); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
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

func GetReviews(c *gin.Context) {
	db := database.DB
	var reviews []models.Review

	if result := db.Find(&reviews); result.Error != nil {
		c.IndentedJSON(404, gin.H{"error": result.Error.Error()})
		return
	}

	c.IndentedJSON(200, reviews)

}

func changeModStatusReview(status ModStatus, reviewID string) (int, error) {
	db := database.DB
	var review models.Review

	if result := db.First(&review, reviewID); result.Error != nil {
		return 404, fmt.Errorf("review not found")
	}
	review.ModStatus = string(status)
	if result := db.Save(&review); result.Error != nil {
		return 500, result.Error
	}
	return 200, nil

}

func ApproveReview(c *gin.Context) {
	id := c.Param("id")
	middleware.CheckAuthExpectedMinRole(c, roles.Admin)
	code, err := changeModStatusReview(ReviewApproved, id)
	if err != nil {
		c.IndentedJSON(code, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(200, nil)
}

func RejectReview(c *gin.Context) {
	id := c.Param("id")
	middleware.CheckAuthExpectedMinRole(c, roles.Admin)
	code, err := changeModStatusReview(ReviewRejected, id)
	if err != nil {
		c.IndentedJSON(code, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(200, nil)
}
