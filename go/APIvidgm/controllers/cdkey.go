package controllers

import (
	"APIvdgm/database"
	"APIvdgm/middleware"
	"APIvdgm/models"
	"APIvdgm/roles"
	"errors"

	"github.com/gin-gonic/gin"
)

type CDKeyStatus string

const (
	CDKeyAvailable CDKeyStatus = "available"
	CDKeyReserved  CDKeyStatus = "reserved"
	CDKeyCanceled  CDKeyStatus = "canceled"
	CDKeyUsed      CDKeyStatus = "used"
)

// GetCDKey godoc
// @Summary Retrieve and activate a CD key
// @Description Returns a CD key by ID and marks it as used if valid. Only the owner of the CD key can access it.
// @Tags CDKeys
// @Accept json
// @Produce json
// @Param id path int true "CD Key ID"
// @Success 200 {object} models.CDKey "CD key retrieved successfully"
// @Failure 403 {object} map[string]string "Forbidden – not the owner or CD key canceled"
// @Failure 404 {object} map[string]string "CD key not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Security ApiKeyAuth
// @Router /cdkeys/{id} [get]
func GetCDKey(c *gin.Context) {
	id := c.Param("id")
	db := database.DB
	var cdkey models.CDKey
	if result := db.Preload("OrderItem").First(&cdkey, id); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "cdkey not found"})
		return
	}
	if cdkey.UserID == nil || cdkey.OrderItem == nil {
		c.IndentedJSON(403, gin.H{"message": "Permission denied, cdkey without owner"})
		return
	}
	if err := middleware.CheckAuthExpectedUser(c, *cdkey.UserID); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
		return
	}

	if cdkey.State == string(CDKeyCanceled) {
		c.IndentedJSON(403, gin.H{"message": "cdkey canceled"})
		return
	}
	cdkey.State = string(CDKeyUsed)
	if result := db.Save(&cdkey); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	c.IndentedJSON(200, cdkey)

}

// RefundCDKey godoc
// @Summary Refund a CD key
// @Description Allows the owner of a CD key to cancel it (refund). Only CD keys that are neither used nor already canceled can be refunded. Requires authentication as the owner.
// @Tags CDKeys
// @Accept json
// @Produce json
// @Param id path int true "CD Key ID"
// @Success 200 {object} models.CDKey "CD key successfully refunded (canceled)"
// @Failure 403 {object} map[string]string "Forbidden – not the owner, CD key already used, or CD key without owner"
// @Failure 404 {object} map[string]string "CD key not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Security ApiKeyAuth
// @Router /cdkeys/{id}/refund [patch]
func RefundCDKey(c *gin.Context) {
	id := c.Param("id")
	db := database.DB
	var cdkey models.CDKey
	if result := db.First(&cdkey, id); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "cdkey not found"})
		return
	}
	if cdkey.UserID == nil || cdkey.OrderItemID == nil {
		c.IndentedJSON(403, gin.H{"message": "Permision denied, cdkey without owner"})
		return
	}
	if err := middleware.CheckAuthExpectedUser(c, *cdkey.UserID); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
		return
	}
	if cdkey.State == string(CDKeyCanceled) {
		c.IndentedJSON(403, gin.H{"message": "cdkey already canceled"})
		return
	}
	if cdkey.State == string(CDKeyUsed) {
		c.IndentedJSON(403, gin.H{"message": "cdkey already used"})
		return
	}
	cdkey.State = string(CDKeyCanceled)
	if result := db.Save(&cdkey); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	c.IndentedJSON(200, cdkey)

}

// CreateCDKey godoc
// @Summary Create a new CD key for a videogame
// @Description Allows an admin to create a new CD key associated with a specific videogame. The videogame's digital stock is incremented by 1. Requires admin privileges.
// @Tags CDKeys
// @Accept json
// @Produce json
// @Param cdkey body models.CDKey true "CD key data to create"
// @Success 201 {object} models.CDKey "CD key created successfully"
// @Failure 400 {object} map[string]string "Invalid request body"
// @Failure 403 {object} map[string]string "Forbidden – insufficient privileges"
// @Failure 404 {object} map[string]string "Videogame not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Security ApiKeyAuth
// @Router /cdkeys [post]
func CreateCDKey(c *gin.Context) {
	if err := middleware.CheckAuthExpectedMinRole(c, roles.Admin); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
		return
	}
	var cdkey models.CDKey
	var videogame models.VideoGame

	if err := c.ShouldBindJSON(&cdkey); err != nil {
		c.IndentedJSON(400, gin.H{"error": err.Error()})
		return
	}
	videogameID := cdkey.VideoGameID
	db := database.DB
	if result := db.First(&videogame, videogameID); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "videogame not found"})
		return
	}
	cdkey.State = string(CDKeyAvailable)
	if result := db.Create(&cdkey); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	videogame.DigStock += 1
	if result := db.Save(&videogame); result.Error != nil {
		// TODO rollback cdkey creation
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}

	c.IndentedJSON(201, cdkey)
}

func getCDKey4Videogame(id string) (*models.CDKey, error) {

	db := database.DB
	var videogame models.VideoGame
	var cdkey models.CDKey
	if result := db.First(&videogame, id); result.Error != nil {
		return nil, errors.New("videogame not found")
	}
	if result := db.Where("video_game_id = ? AND state = ?", id, string(CDKeyAvailable)).First(&cdkey); result.Error != nil {
		return nil, errors.New("no cdkeys available for this videogame")
	}
	return &cdkey, nil

}

// UpdateCDKey godoc
// @Summary Update an existing CD key
// @Description Allows an admin to update the details of an existing CD key. Requires admin privileges.
// @Tags CDKeys
// @Accept json
// @Produce json
// @Param id path int true "CD Key ID"
// @Param cdkey body models.CDKey true "Updated CD key data"
// @Success 200 {object} models.CDKey "CD key updated successfully"
// @Failure 400 {object} map[string]string "Invalid request body"
// @Failure 403 {object} map[string]string "Forbidden – insufficient privileges"
// @Failure 404 {object} map[string]string "CD key not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Security ApiKeyAuth
// @Router /cdkeys/{id} [put]
func UpdateCDKey(c *gin.Context) {
	if err := middleware.CheckAuthExpectedMinRole(c, roles.Admin); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
		return
	}
	id := c.Param("id")
	var newCDKey models.CDKey
	var oldCDKey models.CDKey
	if err := c.ShouldBindJSON(&newCDKey); err != nil {
		c.IndentedJSON(400, gin.H{"error": err.Error()})
		return
	}
	db := database.DB
	if result := db.First(&oldCDKey, id); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "cdkey not found"})
		return
	}
	newCDKey.ID = oldCDKey.ID
	if result := db.Save(&newCDKey); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	c.IndentedJSON(200, newCDKey)
}
