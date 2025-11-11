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

// GetReviewsByVideogameID godoc
// @Summary Get all reviews for a videogame
// @Description Retrieves all reviews associated with a specific videogame by its ID.
// @Tags Reviews
// @Accept json
// @Produce json
// @Param id path int true "Videogame ID"
// @Success 200 {array} models.Review "List of reviews for the videogame"
// @Failure 404 {object} map[string]string "Videogame not found"
// @Router /videogames/{id}/reviews [get]
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

// GetReviewByUserAndGame godoc
// @Summary Get a user's review for a specific videogame
// @Description Retrieves the review written by a specific user for a given videogame. Requires authentication as that user.
// @Tags Reviews
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param gameID path int true "Videogame ID"
// @Success 200 {object} models.Review "User review for the videogame"
// @Failure 403 {object} map[string]string "Unauthorized or insufficient permissions"
// @Failure 404 {object} map[string]string "User, videogame, or review not found"
// @Router /users/{id}/reviews/{gameID} [get]
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

// CreateOrUpdateReview godoc
// @Summary Create or update a user's review for a videogame
// @Description Allows a user to create a new review or update an existing one for a specific videogame. Requires authentication as that user.
// @Tags Reviews
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param gameID path int true "Videogame ID"
// @Param review body models.Review true "Review content (rating, comment, etc.)"
// @Success 200 {object} models.Review "Created or updated review"
// @Failure 400 {object} map[string]string "Invalid input or missing parameters"
// @Failure 403 {object} map[string]string "Unauthorized or insufficient permissions"
// @Failure 404 {object} map[string]string "User or videogame not found"
// @Failure 500 {object} map[string]string "Database or internal error"
// @Router /users/{id}/reviews/{gameID} [post]
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

// GetReviewsByUser godoc
// @Summary Get all reviews made by a user
// @Description Retrieves all reviews created by a specific user. Requires authentication as that user.
// @Tags Reviews
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {array} models.Review "List of user reviews"
// @Failure 403 {object} map[string]string "Unauthorized or insufficient permissions"
// @Failure 404 {object} map[string]string "User not found"
// @Router /users/{id}/reviews [get]
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

// DeleteReview godoc
// @Summary Delete a user review
// @Description Deletes a specific review made by a user. The authenticated user must be the owner of the review.
// @Tags Reviews
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param reviewID path int true "Review ID"
// @Success 200 {object} map[string]string "Review successfully deleted"
// @Failure 403 {object} map[string]string "Review does not belong to user or unauthorized"
// @Failure 404 {object} map[string]string "User or review not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /users/{id}/reviews/{reviewID} [delete]
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

// GetReviews godoc
// @Summary Retrieve all reviews
// @Description Retrieves all reviews from all users for all videogames. Requires appropriate access if restricted.
// @Tags Reviews
// @Accept json
// @Produce json
// @Success 200 {array} models.Review "List of all reviews"
// @Failure 404 {object} map[string]string "Error retrieving reviews"
// @Router /reviews [get]
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

// ApproveReview godoc
// @Summary Approve a user review
// @Description Allows an admin to approve a pending review, changing its moderation status to "approved".
// @Tags Reviews
// @Accept json
// @Produce json
// @Param id path int true "Review ID"
// @Success 200 {string} string "Review approved successfully"
// @Failure 403 {object} map[string]string "Forbidden – insufficient privileges"
// @Failure 404 {object} map[string]string "Review not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Security ApiKeyAuth
// @Router /reviews/{id}/approve [patch]
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

// RejectReview godoc
// @Summary Reject a user review
// @Description Allows an admin to reject a pending review, changing its moderation status to "rejected".
// @Tags Reviews
// @Accept json
// @Produce json
// @Param id path int true "Review ID"
// @Success 200 {string} string "Review rejected successfully"
// @Failure 403 {object} map[string]string "Forbidden – insufficient privileges"
// @Failure 404 {object} map[string]string "Review not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Security ApiKeyAuth
// @Router /reviews/{id}/reject [patch]
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
