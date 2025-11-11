package controllers

import (
	"APIvdgm/database"
	"APIvdgm/middleware"
	"APIvdgm/roles"

	"github.com/gin-gonic/gin"
)

func GetCatalog[T any](c *gin.Context) {
	var catalogs []T
	db := database.DB
	db.Find(&catalogs)
	c.IndentedJSON(200, catalogs)
}

func CreateCatalog[T any](c *gin.Context) {
	if err := middleware.CheckAuthExpectedMinRole(c, roles.Admin); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
		return
	}
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
	if err := middleware.CheckAuthExpectedMinRole(c, roles.Admin); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
		return
	}
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

func GetCatalogByID[T any](c *gin.Context) {
	db := database.DB
	id := c.Param("id")
	var catalog T
	if result := db.First(&catalog, id); result.Error != nil {
		c.IndentedJSON(404, gin.H{"error": result.Error.Error()})
		return
	}
	c.IndentedJSON(200, catalog)
}
