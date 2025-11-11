package controllers

import (
	"APIvdgm/database"
	"APIvdgm/middleware"
	"APIvdgm/models"

	"github.com/gin-gonic/gin"
)

// GetUserByID godoc
// @Summary Get a user by ID
// @Description Retrieves a user by ID along with their cart information. Requires authentication and the same user ID.
// @Tags Users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} models.User
// @Failure 403 {object} map[string]string "Unauthorized or insufficient permissions"
// @Failure 404 {object} map[string]string "User not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /users/{id} [get]
func GetUserByID(c *gin.Context) {

	id := c.Param("id")
	var user models.User
	db := database.DB
	if result := db.Preload("Cart").First(&user, id); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "user not found"})
		return
	}
	if err := middleware.CheckAuthExpectedUser(c, user.ID); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(200, user)
}

// GetUserDirections godoc
// @Summary Get user's delivery directions
// @Description Retrieves all saved delivery directions for a specific user. Requires authentication and the same user ID.
// @Tags Directions
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {array} models.Direction "List of user's delivery directions"
// @Failure 403 {object} map[string]string "Unauthorized or insufficient permissions"
// @Failure 404 {object} map[string]string "User not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /users/{id}/directions [get]
func GetUserDirections(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	db := database.DB
	if result := db.Preload("Directions").First(&user, id); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "user not found"})
		return
	}
	if err := middleware.CheckAuthExpectedUser(c, user.ID); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(200, user.Directions)

}

// NewUserDirection godoc
// @Summary Add a new delivery direction for a user
// @Description Creates and associates a new delivery direction with the specified user. Requires authentication and the same user ID.
// @Tags Directions
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param direction body models.Direction true "New delivery direction data"
// @Success 200 {object} models.Direction
// @Failure 400 {object} map[string]string "Invalid request body"
// @Failure 403 {object} map[string]string "Unauthorized or insufficient permissions"
// @Failure 404 {object} map[string]string "User not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /users/{id}/directions [post]
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
	if err := middleware.CheckAuthExpectedUser(c, user.ID); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
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

// DeleteDirection godoc
// @Summary Delete a user's delivery direction
// @Description Deletes a specific delivery direction by its ID. Requires authentication and that the direction belongs to the authenticated user.
// @Tags Directions
// @Accept json
// @Produce json
// @Param dirID path int true "Direction ID"
// @Success 200 {object} map[string]string "Direction deleted successfully"
// @Failure 400 {object} map[string]string "Direction not found"
// @Failure 403 {object} map[string]string "Unauthorized or insufficient permissions"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /directions/{dirID} [delete]
func DeleteDirection(c *gin.Context) {
	db := database.DB
	dirID := c.Param("dirID")

	var dir models.Direction

	if result := db.First(&dir, dirID); result.Error != nil {
		c.IndentedJSON(400, gin.H{"error": "direction not found"})
		return
	}

	if err := middleware.CheckAuthExpectedUser(c, dir.UserID); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
		return
	}

	if result := db.Delete(&dir); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	c.IndentedJSON(200, gin.H{"message": "direction deleted"})

}

// GetDirectionByID godoc
// @Summary Get a delivery direction by ID
// @Description Retrieves a specific delivery direction by its ID. Requires authentication and that the direction belongs to the authenticated user.
// @Tags Directions
// @Accept json
// @Produce json
// @Param dirID path int true "Direction ID"
// @Success 200 {object} models.Direction
// @Failure 400 {object} map[string]string "Direction not found"
// @Failure 403 {object} map[string]string "Unauthorized or insufficient permissions"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /directions/{dirID} [get]
func GetDirectionByID(c *gin.Context) {
	db := database.DB
	dirID := c.Param("dirID")

	var dir models.Direction

	if result := db.First(&dir, dirID); result.Error != nil {
		c.IndentedJSON(400, gin.H{"error": "direction not found"})
		return
	}
	if err := middleware.CheckAuthExpectedUser(c, dir.UserID); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(200, dir)

}

// ChangeDirection godoc
// @Summary Update a user's delivery direction
// @Description Updates the details of an existing delivery direction. Requires authentication and that the direction belongs to the authenticated user.
// @Tags Directions
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param dirID path int true "Direction ID"
// @Param direction body models.Direction true "Updated delivery direction data"
// @Success 200 {object} map[string]string "Direction updated successfully"
// @Failure 400 {object} map[string]string "User or direction not found"
// @Failure 403 {object} map[string]string "Unauthorized or insufficient permissions"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /users/{id}/directions/{dirID} [put]
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
	if err := middleware.CheckAuthExpectedUser(c, user.ID); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
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
