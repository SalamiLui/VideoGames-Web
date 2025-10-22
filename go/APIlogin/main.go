package main

import (
	"APIlogin/controllers"
	"APIlogin/database"
	"APIlogin/middleware"
	"APIlogin/models"
	"APIlogin/roles"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	database.Connect()
	database.DB.AutoMigrate(&models.User{})
	config := cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}

	router.Use(cors.New(config))

	router.POST(
		"/signup",
		func(c *gin.Context) {
			controllers.SignUp(c, roles.Slave)
		})
	router.POST(
		"/signup/admin",
		middleware.VerifyRole(roles.Root),
		func(c *gin.Context) {
			controllers.SignUp(c, roles.Admin)
		})
	router.POST("/login", controllers.Login)
	router.GET("/verify", controllers.VerifyJWT)

	// TODO implement recover password

	router.Run("localhost:8081")

}
