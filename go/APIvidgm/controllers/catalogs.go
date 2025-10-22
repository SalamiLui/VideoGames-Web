package controllers

import (
	"APIvdgm/database"

	"github.com/gin-gonic/gin"
)

func GetCatalog[T any](c *gin.Context) {
	var catalogs []T
	db := database.DB
	db.Find(&catalogs)
	c.IndentedJSON(200, catalogs)
}

func CreateCatalog[T any](c *gin.Context) {
	var catalog T
	db := database.DB
	if err := c.ShouldBindJSON(&catalog); err != nil {
		c.IndentedJSON(400, gin.H{"error": err.Error()})
		return
	}
	if result := db.Save(&catalog); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	c.IndentedJSON(200, catalog)

}

func DeleteCatalog[T any](c *gin.Context) {
	id := c.Param("id")
	db := database.DB
	var catalog T
	if result := db.First(&catalog, id); result.Error != nil {
		c.IndentedJSON(400, gin.H{"error": result.Error.Error()})
		return
	}
	if result := db.Delete(&catalog); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	c.IndentedJSON(200, gin.H{"message": "catalog deleted"})
}
