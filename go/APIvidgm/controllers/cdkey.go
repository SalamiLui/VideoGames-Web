package controllers

import (
	"APIvdgm/database"
	"APIvdgm/models"
	"errors"

	"github.com/gin-gonic/gin"
)

type CDKeyStatus string

const (
	CDKeyAvailable CDKeyStatus = "available"
	CDKeyReserved  CDKeyStatus = "reserved"
	CDKeyCanceled  CDKeyStatus = "canceled"
)

func GetCDKey(c *gin.Context) {
	id := c.Param("id")
	db := database.DB
	var cdkey models.CDKey
	if result := db.First(&cdkey, id); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "cdkey not found"})
		return
	}
	c.IndentedJSON(200, cdkey)

}

func CreateCDKey(c *gin.Context) {
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

func GetCDKey4Videogame(c *gin.Context) {
	id := c.Param("id")
	cdkey, err := getCDKey4Videogame(id)
	if err != nil {
		c.IndentedJSON(404, gin.H{"message": err.Error()})
		return
	}
	c.IndentedJSON(200, cdkey)

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

func UpdateCDKey(c *gin.Context) {
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
