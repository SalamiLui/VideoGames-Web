package controllers

import (
	"APIvdgm/database"
	"APIvdgm/models"

	"github.com/gin-gonic/gin"
)

// GetFilters godoc
// @Summary Retrieve all available filters for videogames
// @Description Returns all available genres, platforms, and labels that can be used as filters for videogames.
// @Tags Filters
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "Object containing arrays of genres, platforms, and labels"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /filters [get]
func GetFilters(c *gin.Context) {
	db := database.DB
	var genres []models.Genre
	var platforms []models.Platform
	var labels []models.Label

	db.Find(&genres)
	db.Find(&platforms)
	db.Find(&labels)

	c.IndentedJSON(200, gin.H{
		"genres":    genres,
		"platforms": platforms,
		"labels":    labels,
	})
}
