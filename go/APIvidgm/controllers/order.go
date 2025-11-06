package controllers

import (
	"APIvdgm/database"
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
	c.IndentedJSON(200, user.PhyOrders)
}

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
	c.IndentedJSON(200, phyOrder)
}

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
	c.IndentedJSON(200, digOrder)
}
