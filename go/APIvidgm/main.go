package main

import (
	"APIvdgm/controllers"
	"APIvdgm/database"
	"APIvdgm/models"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	database.Connect()

	database.DB.AutoMigrate(
		&models.User{},
		&models.VideoGame{},
		&models.PhyOrder{},
		&models.CartItem{},
		&models.Cart{},
		&models.Review{},
		&models.WishList{},
		&models.Direction{},
		&models.Genre{},
		&models.Platform{},
		&models.Label{},
		&models.CDKey{},
		&models.DigOrder{},
		&models.OrderItem{},
	)

	config := cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}

	router.Use(cors.New(config))

	// TODO implement Middleware for authentication with the jwt
	// TODO modify game rating when user rates game and add 2 reviews the game title

	router.GET("/videogames", controllers.GetVideogames)
	router.GET("/videogames/:id", controllers.GetVideogameByID)
	router.POST("/videogames", controllers.CreateVideogame)
	router.DELETE("/videogames/:id", controllers.DeleteVideogame)
	router.PUT("/videogames/:id", controllers.UpdateVideogame)
	router.GET("/videogames/:id/reviews/", controllers.GetReviewsByVideogameID)

	router.GET("/filters", controllers.GetFilters)

	router.POST("/genres", controllers.CreateCatalog[models.Genre])
	router.GET("/genres", controllers.GetCatalog[models.Genre])
	router.DELETE("/genres/:id", controllers.DeleteCatalog[models.Genre])

	router.POST("/labels", controllers.CreateCatalog[models.Label])
	router.GET("/labels", controllers.GetCatalog[models.Label])
	router.DELETE("/labels/:id", controllers.DeleteCatalog[models.Label])

	router.POST("/platforms", controllers.CreateCatalog[models.Platform])
	router.GET("/platforms", controllers.GetCatalog[models.Platform])
	router.DELETE("/platforms/:id", controllers.DeleteCatalog[models.Platform])

	router.GET("/users/:id", controllers.GetUserByID)

	// cart is create automatically if not found when getting / adding to cart
	router.GET("/users/:id/cart", controllers.GetCartByUserID)
	// wishlist is created automatically if not found when getting / adding to wishlist
	router.GET("/users/:id/wishlist", controllers.GetWishlistByUserID)

	router.POST("users/:id/cartitem", controllers.AddItemToCart)
	router.PUT("users/:id/cartitem/:itemid", controllers.UpdateItemCart)
	router.DELETE("users/:id/cartitem/:itemid", controllers.DeleteItemCart)

	router.GET("/users/:id/directions", controllers.GetUserDirections)
	router.POST("/users/:id/directions", controllers.NewUserDirection)
	router.DELETE("/users/:id/directions/:dirID", controllers.DeleteDirection)
	router.GET("/users/:id/directions/:dirID", controllers.GetDirectionByID)
	router.PUT("/users/:id/directions/:dirID", controllers.ChangeDirection)

	// querry dirID needed in case phyOrders in cart
	router.PUT("/carts/:id/checkout", controllers.CheckoutCart)

	router.GET("/users/:id/phyOrders", controllers.GetPhyOrders)
	router.GET("/users/:id/digOrders", controllers.GetDigOrders)
	router.GET("/phyOrder/:orderID", controllers.GetPhyOrderByID)
	router.GET("/digOrder/:orderID", controllers.GetDigOrderByID)

	router.POST("users/:id/wishlist/addVideogame/:vid", controllers.AddVideogame2Wishlist)
	router.DELETE("/users/:id/wishlist/deleteVideogame/:vid", controllers.DeleteVideogameWishlist)

	router.GET("/users/:id/games/:gameID/review", controllers.GetReviewByUserAndGame)
	router.PUT("/users/:id/games/:gameID/review", controllers.CreateOrUpdateReview)
	router.GET("/users/:id/reviews", controllers.GetReviewsByUser)
	router.DELETE("/users/:id/review/:reviewID", controllers.DeleteReview)

	router.GET("/cdkeys/:id", controllers.GetCDKey)
	router.POST("/cdkeys", controllers.CreateCDKey)
	router.PUT("/cdkeys/:id", controllers.UpdateCDKey)
	router.PUT("/cdkeys/:id/refund", controllers.RefundCDKey)

	router.Run("localhost:8080")

}
