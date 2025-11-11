package controllers

import (
	"APIvdgm/database"
	"APIvdgm/middleware"
	"APIvdgm/models"

	"github.com/gin-gonic/gin"
)

func CreateWishlist(id uint) (int, gin.H) {
	db := database.DB
	var wishlit models.WishList
	userID := id
	var user models.User
	if result := db.First(&user, userID); result.Error != nil {
		return 404, gin.H{"message": "user not found"}
	}
	wishlit.UserID = user.ID
	if result := db.Create(&wishlit); result.Error != nil {
		return 500, gin.H{"error": result.Error.Error()}

	}
	return 201, gin.H{"message": "wishlist created"}
}

func AddVideogame2Wishlist(c *gin.Context) {
	db := database.DB
	var user models.User
	var wishlist models.WishList
	var videogame models.VideoGame
	userID := c.Param("id")
	videogameID := c.Param("vid")

	if result := db.Preload("WishList.VideoGames").First(&user, userID); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "user not found"})
		return
	}
	if err := middleware.CheckAuthExpectedUser(c, user.ID); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
		return
	}
	if result := db.First(&videogame, videogameID); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "videogame not found"})
		return
	}
	if user.WishList == nil {
		status, ginh := CreateWishlist(user.ID)
		if status != 200 {
			c.IndentedJSON(status, ginh)
			return
		}
	}
	wishlist = *user.WishList
	if isVideogameInWishlist(wishlist, videogame.ID) {
		c.IndentedJSON(409, gin.H{"message": "videogame already in wishlist"})
		return
	}

	wishlist.VideoGames = append(wishlist.VideoGames, &videogame)
	if result := db.Save(&wishlist); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	c.IndentedJSON(200, wishlist)
}

func isVideogameInWishlist(wishlist models.WishList, vid uint) bool {
	for _, v := range wishlist.VideoGames {
		if v.ID == vid {
			return true
		}
	}
	return false
}

func DeleteVideogameWishlist(c *gin.Context) {
	db := database.DB
	var user models.User
	var wishlist models.WishList
	var videogame models.VideoGame
	userID := c.Param("id")
	videogameID := c.Param("vid")
	if result := db.Preload("WishList.VideoGames").First(&user, userID); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "user not found"})
		return
	}
	if err := middleware.CheckAuthExpectedUser(c, user.ID); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
		return
	}
	if result := db.First(&videogame, videogameID); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "videogame not found"})
		return
	}
	wishlist = *user.WishList
	if result := db.Model(&wishlist).Association("VideoGames").Delete(&videogame); result != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error()})
		return
	}
	c.IndentedJSON(200, gin.H{"message": "videogame removed from wishlist"})
}

func GetWishlistByUserID(c *gin.Context) {
	userID := c.Param("id")
	var user models.User
	db := database.DB
	if result := db.Preload("WishList.VideoGames.Genre").
		Preload("WishList.VideoGames.Platform").
		First(&user, userID); result.Error != nil {
		c.IndentedJSON(404, gin.H{"message": "user not found"})
		return
	}
	if err := middleware.CheckAuthExpectedUser(c, user.ID); err != nil {
		c.IndentedJSON(403, gin.H{"error": err.Error()})
		return
	}
	if user.WishList == nil {
		status, ginh := CreateWishlist(user.ID)
		if status != 200 {
			c.IndentedJSON(status, ginh)
			return
		}
	}

	c.IndentedJSON(200, user.WishList)
}
