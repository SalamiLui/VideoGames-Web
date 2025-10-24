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

	// TODO create endopoints with preload for relational models

	router.GET("/videogames", controllers.GetVideogames)
	router.GET("/videogames/:id", controllers.GetVideogameByID)
	router.POST("/videogames", controllers.CreateVideogame)
	router.DELETE("/videogames/:id", controllers.DeleteVideogame)
	router.PUT("/videogames/:id", controllers.UpdateVideogame)
	router.GET("/videogames/:id/cdkey/available", controllers.GetCDKey4Videogame)
	router.POST("/videogames/:id/user/:uid/newReview", controllers.CreateReview)
	router.GET("/videogames/:id/reviews/", controllers.GetReviewsByVideogameID)

	// TODO tf implement filters?
	// router.GET("/videogames/filter/:genreid", controllers.GetVideogamesByCatalog[models.Genre])

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

	// querry dirID needed in case phyOrders in cart
	router.PUT("/carts/:id/checkout", controllers.CheckoutCart)

	router.POST("users/:id/wishlist/addVideogame/:vid", controllers.AddVideogame2Wishlist)
	router.DELETE("/users/:id/wishlist/deleteVideogame/:vid", controllers.DeleteVideogameWishlist)

	router.PUT("/review/:id", controllers.UpdateReview)

	router.GET("/cdkeys/:id", controllers.GetCDKey)
	router.POST("/cdkeys", controllers.CreateCDKey)
	router.PUT("/cdkeys/:id", controllers.UpdateCDKey)

	router.Run("localhost:8080")

}
