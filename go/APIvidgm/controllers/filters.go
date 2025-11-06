package controllers

import (
	"APIvdgm/database"
	"APIvdgm/models"

	"github.com/gin-gonic/gin"
)

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
