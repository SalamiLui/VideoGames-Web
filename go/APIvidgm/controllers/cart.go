package controllers

import (
	"APIvdgm/database"
	"APIvdgm/models"
	"fmt"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetCartByUserID(c *gin.Context) {
	userID := c.Param("id")
	var user models.User
	var cart models.Cart
	db := database.DB
	if result := db.Preload("Cart.VideoGames.VideoGame").Find(&user, userID); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "user not found"})
		return
	}
	if user.Cart == nil {
		if code, obj := CreateCart(userID); code != 200 {
			c.IndentedJSON(code, obj)
			return
		}
		CreateCart(userID)
	}
	cart = *user.Cart
	c.IndentedJSON(200, cart)
}

func CreateCart(userID string) (int, any) {
	var cart models.Cart
	var user models.User
	db := database.DB
	if result := db.First(&user, userID); result.Error != nil {
		return 404, gin.H{"message": "user not found"}
	}
	cart.UserID = user.ID
	cart.TotalPrice = 0
	if result := db.Create(&cart); result.Error != nil {
		return 500, gin.H{"error": result.Error.Error()}
	}
	return 200, gin.H{"message": "created"}
}

func AddItemToCart(c *gin.Context) {
	userID := c.Param("id")
	var user models.User
	var cart models.Cart
	var videogame models.VideoGame
	var cartItem models.CartItem

	if err := c.ShouldBindJSON(&cartItem); err != nil {
		c.IndentedJSON(400, gin.H{"error": err.Error()})
		return
	}

	db := database.DB
	if result := db.Preload("Cart").Find(&user, userID); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "user not found"})
		return
	}
	if user.Cart == (nil) {
		if code, obj := CreateCart(userID); code != 200 {
			c.IndentedJSON(code, obj)
			return
		}
	}
	cart = *user.Cart

	if result := db.First(&videogame, cartItem.VideoGameID); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "videogame not found"})
		return
	}
	cartItem.CartID = cart.ID
	if result := db.Create(&cartItem); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	cart.TotalPrice += (videogame.Price * float64(cartItem.Quantity))
	if result := db.Save(&cart); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	c.IndentedJSON(201, cartItem)

}

func UpdateItemCart(c *gin.Context) {
	userID := c.Param("id")
	itemID := c.Param("itemid")
	var newCartItem models.CartItem
	var oldCartItem models.CartItem
	var user models.User

	if err := c.ShouldBindJSON(&newCartItem); err != nil {
		c.IndentedJSON(400, gin.H{"error": err.Error()})
		return
	}
	fmt.Println(newCartItem)
	db := database.DB
	if result := db.Preload("VideoGame").First(&oldCartItem, itemID); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "cart item not found"})
		return
	}
	if result := db.Preload("Cart").First(&user, userID); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "user not found"})
		return
	}
	if user.Cart == nil {
		c.IndentedJSON(404, gin.H{"message": "user has no cart"})
		return
	}
	if user.Cart.ID != oldCartItem.CartID {
		c.IndentedJSON(403, gin.H{"message": "cart item does not belong to user"})
		return
	}
	newCartItem.ID = oldCartItem.ID
	newCartItem.VideoGameID = oldCartItem.VideoGameID
	newCartItem.CartID = oldCartItem.CartID
	if result := db.Save(&newCartItem); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	user.Cart.TotalPrice -= (oldCartItem.VideoGame.Price * float64(oldCartItem.Quantity))
	user.Cart.TotalPrice += (oldCartItem.VideoGame.Price * float64(newCartItem.Quantity))
	if result := db.Save(&user.Cart); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}

	c.IndentedJSON(200, gin.H{"new_total": user.Cart.TotalPrice})

}

func DeleteItemCart(c *gin.Context) {
	userID := c.Param("id")
	itemID := c.Param("itemid")
	var user models.User
	var cartItem models.CartItem

	db := database.DB
	if result := db.Preload("VideoGame").First(&cartItem, itemID); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "cart item not found"})
		return
	}
	if result := db.Preload("Cart").First(&user, userID); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "user not found"})
		return
	}
	if user.Cart == nil {
		c.IndentedJSON(404, gin.H{"message": "user has no cart"})
		return
	}
	if user.Cart.ID != cartItem.CartID {
		c.IndentedJSON(403, gin.H{"message": "cart item does not belong to user"})
		return
	}

	user.Cart.TotalPrice -= (cartItem.VideoGame.Price * float64(cartItem.Quantity))
	if result := db.Save(&user.Cart); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}

	if result := db.Delete(&cartItem); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	c.IndentedJSON(200, gin.H{"message": "cart item deleted"})

}

func CheckoutCart(c *gin.Context) {
	id := c.Param("id")
	db := database.DB
	var cart models.Cart
	var digOrders models.DigOrder
	var phyOrders models.PhyOrder

	if result := db.Preload("VideoGames").Preload("VideoGames.VideoGame").First(&cart, id); result.Error != nil {
		c.IndentedJSON(400, gin.H{"error": "cart not found"})
		return
	}
	for _, v := range cart.VideoGames {
		if v.IsPhysical {
			phyOrders.VideoGames = append(phyOrders.VideoGames, v)
		} else {
			digOrders.VideoGames = append(digOrders.VideoGames, v)
		}
	}

	if len(phyOrders.VideoGames) > 0 {
		var dirid uint
		str := c.Query("dirID")
		n64, err := strconv.ParseUint(str, 10, 64)
		if err != nil {
			c.IndentedJSON(500, gin.H{"error": "dirID querry failed to parse"})
			return
		}
		dirid = uint(n64)
		err = createPhyOrder(&phyOrders, dirid, cart.UserID)
		if err != nil {
			c.IndentedJSON(500, gin.H{"error": err.Error()})
			return
		}
	}
	if len(digOrders.VideoGames) > 0 {
		// TODO implement security if needed when sending cdkeys
		err := createDigOrder(&digOrders, cart.UserID)
		if err != nil {
			c.IndentedJSON(500, gin.H{"error": err.Error()})
			return
		}
	}
	cart.VideoGames = nil
	cart.TotalPrice = 0
	if result := db.Save(&cart); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	c.IndentedJSON(200, gin.H{"message": "checkout completed"})

}

func createPhyOrder(o *models.PhyOrder, directionid, userid uint) error {
	o.DirectionID = directionid
	o.UserID = userid
	o.Status = string(OrderPending)
	o.TotalPrice = computeTotalPrice(o.VideoGames)

	db := database.DB
	return db.Create(&o).Error

}

func createDigOrder(o *models.DigOrder, userid uint) error {
	o.UserID = userid
	o.Status = string(OrderPending)
	o.TotalPrice = computeTotalPrice(o.VideoGames)

	for _, v := range o.VideoGames {
		str := strconv.FormatUint(uint64(v.VideoGameID), 10)
		cdkey, err := getCDKey4Videogame(str)
		if err != nil {
			return err
		}
		cdkey.State = string(CDKeyReserved)
		o.CDKeys = append(o.CDKeys, cdkey)
	}

	db := database.DB
	return db.Create(&o).Error

}

func computeTotalPrice(items []*models.CartItem) float64 {
	sum := float64(0)
	for _, i := range items {
		sum += (i.VideoGame.Price * float64(i.Quantity))
	}
	return sum
}
