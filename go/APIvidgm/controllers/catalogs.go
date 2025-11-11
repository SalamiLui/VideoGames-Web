package controllers

import (
	"APIvdgm/database"
	"APIvdgm/middleware"
	"APIvdgm/roles"

	"github.com/gin-gonic/gin"
)

// GetCatalog godoc
// @Summary Get all catalog entries
// @Description Retrieves all entries from a specific catalog (e.g., Genre, Platform, or Label).
// @Tags Catalog
// @Accept json
// @Produce json
// @Success 200 {array} object "List of catalog entries"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /catalog [get]
func GetCatalog[T any](c *gin.Context) {
	var catalogs []T
	db := database.DB
	db.Find(&catalogs)
	c.IndentedJSON(200, catalogs)
}

// CreateCatalog godoc
// @Summary Create a new catalog entry
// @Description Creates a new catalog record (e.g., Genre, Platform, or Label). Requires admin privileges.
// @Tags Catalog
// @Accept json
// @Produce json
// @Param catalog body object true "Catalog data (Genre, Platform, or Label)"
// @Success 200 {object} object "Catalog entry created successfully"
// @Failure 400 {object} map[string]string "Invalid request body"
// @Failure 403 {object} map[string]string "Unauthorized or insufficient permissions"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /catalog [post]
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

// DeleteCatalog godoc
// @Summary Delete a catalog entry
// @Description Deletes a catalog entry (e.g., Genre, Platform, or Label) by its ID. Requires admin privileges.
// @Tags Catalog
// @Accept json
// @Produce json
// @Param id path int true "Catalog entry ID"
// @Success 200 {object} map[string]string "Catalog entry deleted successfully"
// @Failure 400 {object} map[string]string "Invalid catalog ID or entry not found"
// @Failure 403 {object} map[string]string "Unauthorized or insufficient permissions"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /catalog/{id} [delete]
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

// GetCatalogByID godoc
// @Summary Get a catalog entry by ID
// @Description Retrieves a single catalog entry (e.g., Genre, Platform, or Label) by its ID.
// @Tags Catalog
// @Accept json
// @Produce json
// @Param id path int true "Catalog entry ID"
// @Success 200 {object} object "Catalog entry data"
// @Failure 404 {object} map[string]string "Catalog entry not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /catalog/{id} [get]
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
