package controllers

import (
	"APIvdgm/database"
	"APIvdgm/middleware"
	"APIvdgm/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type OrderStatus string

const (
	OrderPending   OrderStatus = "pending"
	OrderCompleted OrderStatus = "completed"
	OrderCanceled  OrderStatus = "canceled"
)

// GetPhyOrders godoc
// @Summary Get user's physical orders
// @Description Retrieves all physical orders for a specific user, including order items and their associated video games. Requires authentication and the same user ID.
// @Tags Orders
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {array} models.PhyOrder "List of user's physical orders"
// @Failure 400 {object} map[string]string "User not found"
// @Failure 403 {object} map[string]string "Unauthorized or insufficient permissions"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /users/{id}/orders/physical [get]
func GetPhyOrders(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	db := database.DB
	if result := db.Preload("PhyOrders").
		Preload("PhyOrders.OrderItems").
		Preload("PhyOrders.OrderItems.VideoGame").
		First(&user, id); result.Error != nil {
		c.IndentedJSON(400, gin.H{"error": "User not found"})
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
	c.IndentedJSON(200, user.PhyOrders)
}

// GetDigOrders godoc
// @Summary Get user's digital orders
// @Description Retrieves all digital orders for a specific user, including order items and their associated video games. Requires authentication and the same user ID.
// @Tags Orders
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {array} models.DigOrder "List of user's digital orders"
// @Failure 400 {object} map[string]string "User not found"
// @Failure 403 {object} map[string]string "Unauthorized or insufficient permissions"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /users/{id}/orders/digital [get]
func GetDigOrders(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	db := database.DB
	if result := db.Preload("DigOrders").
		Preload("DigOrders.OrderItems").
		Preload("DigOrders.OrderItems.VideoGame").
		First(&user, id); result.Error != nil {
		c.IndentedJSON(400, gin.H{"error": "User not found"})
		return
	}
	c.IndentedJSON(200, user.DigOrders)
}

// GetPhyOrderByID godoc
// @Summary Get a physical order by ID
// @Description Retrieves a specific physical order by its ID, including all order items and their associated video games. Requires authentication as the order's owner.
// @Tags Orders
// @Accept json
// @Produce json
// @Param orderID path int true "Physical Order ID"
// @Success 200 {object} models.PhyOrder "Physical order details"
// @Failure 400 {object} map[string]string "Order not found"
// @Failure 403 {object} map[string]string "Unauthorized or insufficient permissions"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /orders/physical/{orderID} [get]
func GetPhyOrderByID(c *gin.Context) {
	phyOrderID := c.Param("orderID")
	var phyOrder models.PhyOrder
	db := database.DB

	if result := db.Preload("OrderItems").
		Preload("OrderItems.VideoGame").
		First(&phyOrder, phyOrderID); result.Error != nil {
		c.IndentedJSON(400, gin.H{"error": "order not found"})
		return
	}
	if err := middleware.CheckAuthExpectedUser(c, phyOrder.UserID); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(200, phyOrder)
}

// GetDigOrderByID godoc
// @Summary Get a digital order by ID
// @Description Retrieves a specific digital order by its ID, including order items, their associated video games, and CD keys (without exposing sensitive data). Requires authentication as the order's owner.
// @Tags Orders
// @Accept json
// @Produce json
// @Param orderID path int true "Digital Order ID"
// @Success 200 {object} models.DigOrder "Digital order details"
// @Failure 400 {object} map[string]string "Order not found"
// @Failure 403 {object} map[string]string "Unauthorized or insufficient permissions"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /orders/digital/{orderID} [get]
func GetDigOrderByID(c *gin.Context) {
	digOrderID := c.Param("orderID")
	var digOrder models.DigOrder
	db := database.DB

	if result := db.Preload("OrderItems").
		Preload("OrderItems.CDkey", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "state", "order_item_id")
		}).
		Preload("OrderItems.VideoGame").
		First(&digOrder, digOrderID); result.Error != nil {
		c.IndentedJSON(400, gin.H{"error": "order not found"})
		return
	}
	if err := middleware.CheckAuthExpectedUser(c, digOrder.UserID); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(200, digOrder)
}
