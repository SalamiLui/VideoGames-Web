package main

import (
	"APIvdgm/controllers"
	"APIvdgm/database"
	"APIvdgm/middleware"
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

	authGroup := router.Group("/")
	authGroup.Use(middleware.VerifyJWT())
	{
		authGroup.POST("/videogames", controllers.CreateVideogame)
		authGroup.DELETE("/videogames/:id", controllers.DeleteVideogame)
		authGroup.PUT("/videogames/:id", controllers.UpdateVideogame)

		authGroup.POST("/genres", controllers.CreateCatalog[models.Genre])
		authGroup.GET("/genres", controllers.GetCatalog[models.Genre])
		authGroup.GET("/genres/:id", controllers.GetCatalogByID[models.Genre])
		authGroup.DELETE("/genres/:id", controllers.DeleteCatalog[models.Genre])

		authGroup.POST("/labels", controllers.CreateCatalog[models.Label])
		authGroup.GET("/labels", controllers.GetCatalog[models.Label])
		authGroup.GET("/labels/:id", controllers.GetCatalogByID[models.Label])
		authGroup.DELETE("/labels/:id", controllers.DeleteCatalog[models.Label])

		authGroup.POST("/platforms", controllers.CreateCatalog[models.Platform])
		authGroup.GET("/platforms", controllers.GetCatalog[models.Platform])
		authGroup.GET("/platforms/:id", controllers.GetCatalogByID[models.Platform])
		authGroup.DELETE("/platforms/:id", controllers.DeleteCatalog[models.Platform])

		authGroup.GET("/users/:id", controllers.GetUserByID)

		// cart is created automatically if not found when getting / adding to cart
		authGroup.GET("/users/:id/cart", controllers.GetCartByUserID)

		// wishlist is created automatically if not found when getting / adding to wishlist
		authGroup.GET("/users/:id/wishlist", controllers.GetWishlistByUserID)

		authGroup.POST("users/:id/cartitem", controllers.AddItemToCart)
		authGroup.PUT("users/:id/cartitem/:itemid", controllers.UpdateItemCart)
		authGroup.DELETE("users/:id/cartitem/:itemid", controllers.DeleteItemCart)

		// querry dirID needed in case phyOrders in cart
		authGroup.PUT("/carts/:id/checkout", controllers.CheckoutCart)

		authGroup.GET("/users/:id/directions", controllers.GetUserDirections)
		authGroup.POST("/users/:id/directions", controllers.NewUserDirection)
		authGroup.DELETE("/users/:id/directions/:dirID", controllers.DeleteDirection)
		authGroup.GET("/users/:id/directions/:dirID", controllers.GetDirectionByID)
		authGroup.PUT("/users/:id/directions/:dirID", controllers.ChangeDirection)

		authGroup.GET("/users/:id/phyOrders", controllers.GetPhyOrders)
		authGroup.GET("/users/:id/digOrders", controllers.GetDigOrders)
		authGroup.GET("/phyOrder/:orderID", controllers.GetPhyOrderByID)
		authGroup.GET("/digOrder/:orderID", controllers.GetDigOrderByID)

		authGroup.POST("users/:id/wishlist/addVideogame/:vid", controllers.AddVideogame2Wishlist)
		authGroup.DELETE("/users/:id/wishlist/deleteVideogame/:vid", controllers.DeleteVideogameWishlist)

		authGroup.GET("/users/:id/games/:gameID/review", controllers.GetReviewByUserAndGame)
		authGroup.PUT("/users/:id/games/:gameID/review", controllers.CreateOrUpdateReview)
		authGroup.GET("/users/:id/reviews", controllers.GetReviewsByUser)
		authGroup.DELETE("/users/:id/review/:reviewID", controllers.DeleteReview)

		authGroup.PUT("/reviews/:id/approve", controllers.ApproveReview)
		authGroup.PUT("/reviews/:id/reject", controllers.RejectReview)

		authGroup.GET("/cdkeys/:id", controllers.GetCDKey)
		authGroup.POST("/cdkeys", controllers.CreateCDKey)
		authGroup.PUT("/cdkeys/:id", controllers.UpdateCDKey)
		authGroup.PUT("/cdkeys/:id/refund", controllers.RefundCDKey)

	}

	// TODO modify game rating when user rates game and add 2 reviews the game title

	router.GET("/videogames", controllers.GetVideogames)
	router.GET("/videogames/:id", controllers.GetVideogameByID)
	router.GET("/videogames/:id/reviews/", controllers.GetReviewsByVideogameID)
	router.GET("/filters", controllers.GetFilters)

	router.GET("/reviews", controllers.GetReviews)

	router.Run("localhost:8080")

}
