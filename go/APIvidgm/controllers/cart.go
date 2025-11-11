package controllers

import (
	"APIvdgm/database"
	"APIvdgm/middleware"
	"APIvdgm/models"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
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
	if err := middleware.CheckAuthExpectedUser(c, user.ID); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
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
	if err := middleware.CheckAuthExpectedUser(c, user.ID); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
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
	if err := middleware.CheckAuthExpectedUser(c, user.ID); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
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
	if err := middleware.CheckAuthExpectedUser(c, user.ID); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
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

func checkOut(tx *gorm.DB, id string, c *gin.Context) error {
	var cart models.Cart
	var digOrders models.DigOrder
	var phyOrders models.PhyOrder

	if result := tx.Preload("VideoGames").Preload("VideoGames.VideoGame").First(&cart, id); result.Error != nil {
		return fmt.Errorf("cart not found")
	}
	if err := middleware.CheckAuthExpectedUser(c, cart.UserID); err != nil {
		return err
	}
	for _, i := range cart.VideoGames {
		var orderI models.OrderItem
		orderI.Quantity = i.Quantity
		orderI.VideoGame = i.VideoGame
		orderI.VideoGameID = i.VideoGame.ID

		if i.IsPhysical {
			phyOrders.OrderItems = append(phyOrders.OrderItems, &orderI)
		} else {
			digOrders.OrderItems = append(digOrders.OrderItems, &orderI)
		}
	}

	if len(phyOrders.OrderItems) > 0 {
		var dirid uint
		str := c.Query("dirID")
		n64, err := strconv.ParseUint(str, 10, 64)
		if err != nil {
			return fmt.Errorf("dirID querry failed to parse")
		}
		dirid = uint(n64)
		err = createPhyOrder(tx, &phyOrders, dirid, cart.UserID)
		if err != nil {
			return err
		}

	}
	if len(digOrders.OrderItems) > 0 {
		// TODO implement security if needed when sending cdkeys
		err := createDigOrder(tx, &digOrders, cart.UserID)
		if err != nil {
			return err
		}
		if err := assignCDKeys(tx, &digOrders); err != nil {
			return err
		}
	}
	if err := tx.Model(&cart).Association("VideoGames").Clear(); err != nil {
		return err
	}
	cart.VideoGames = nil
	cart.TotalPrice = 0
	if result := tx.Save(&cart); result.Error != nil {
		return result.Error
	}
	return nil

}

func CheckoutCart(c *gin.Context) {
	id := c.Param("id")
	db := database.DB

	err := db.Transaction(func(tx *gorm.DB) error {
		return checkOut(tx, id, c)
	})

	if err != nil {
		c.IndentedJSON(500, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(200, gin.H{"message": "checkout completed"})

}

func createPhyOrder(tx *gorm.DB, o *models.PhyOrder, directionid, userid uint) error {
	o.UserID = userid
	o.Status = string(OrderPending)
	o.TotalPrice = computeTotalPrice(o.OrderItems)

	var direction models.Direction

	if result := tx.First(&direction, directionid); result.Error != nil {
		return result.Error
	}
	jsonDir, err := json.Marshal(direction)
	if err != nil {
		return err
	}
	o.Direction = datatypes.JSON(jsonDir)

	for _, item := range o.OrderItems {
		if err := manageGamesStock(tx, item.VideoGameID, item.Quantity, true); err != nil {
			return err
		}
	}

	return tx.Session(&gorm.Session{FullSaveAssociations: true}).Create(&o).Error

}

func createDigOrder(tx *gorm.DB, o *models.DigOrder, userid uint) error {
	o.UserID = userid
	o.Status = string(OrderPending)
	o.TotalPrice = computeTotalPrice(o.OrderItems)

	return tx.Session(&gorm.Session{FullSaveAssociations: true}).Create(&o).Error

}

func assignCDKeys(tx *gorm.DB, o *models.DigOrder) error {
	for _, item := range o.OrderItems {
		for i := 0; i < item.Quantity; i++ {
			cdkey, err := getCDKey4Videogame(strconv.FormatUint(uint64(item.VideoGameID), 10))
			if err != nil {
				return err
			}

			cdkey.State = string(CDKeyReserved)
			cdkey.OrderItemID = &item.ID
			cdkey.UserID = &o.UserID

			if err := tx.Save(cdkey).Error; err != nil {
				return err
			}
		}

		if err := manageGamesStock(tx, item.VideoGameID, item.Quantity, false); err != nil {
			return err
		}
	}
	return nil
}

func computeTotalPrice(items []*models.OrderItem) float64 {
	sum := float64(0)
	for _, i := range items {
		sum += (i.VideoGame.Price * float64(i.Quantity))
	}
	return sum
}

func manageGamesStock(tx *gorm.DB, gameID uint, checkoutQ int, isPhy bool) error {

	var game models.VideoGame

	lockQuery := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
		First(&game, gameID)

	if lockQuery.Error != nil {
		returnErr := fmt.Errorf("game not found")
		return returnErr
	}

	var stock *int
	if isPhy {
		stock = &game.PhyStock
	} else {
		stock = &game.DigStock
	}

	// Validar stock suficiente
	if *stock < checkoutQ {
		return fmt.Errorf("stock insufficient")
	}

	// Restar stock
	*stock -= checkoutQ

	// Guardar cambios
	if err := tx.Save(&game).Error; err != nil {
		return err
	}

	return nil
}
