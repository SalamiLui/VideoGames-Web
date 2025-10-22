package controllers

import (
	"APIlogin/database"
	"APIlogin/models"
	"APIlogin/roles"
	"fmt"
	"net/http"
	"net/mail"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func SignUp(c *gin.Context, role roles.Role) {

	var user models.User

	if err := c.ShouldBindJSON(&user); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db := database.DB

	if user.Username == "" || user.Password == "" {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Username and password required"})
		return
	}

	_, err := mail.ParseAddress(user.Mail)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Invalid email address"})
		return
	}

	hashedPassword, err := hashPassword(user.Password)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "Error hashing password"})
		return
	}
	user.Password = hashedPassword
	user.Role = string(role)

	if result := db.Where("username = ?", user.Username).First(&models.User{}); result.RowsAffected != 0 {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Username already taken"})
		return
	}

	if result := db.Where("mail = ?", user.Mail).First(&models.User{}); result.RowsAffected != 0 {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Email already registered"})
		return
	}

	if result := db.Create(&user); result.Error != nil {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "error creating new user"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": "user created successfully"})

}

func Login(c *gin.Context) {
	var user models.User
	var foundUser models.User

	if err := c.ShouldBindJSON(&user); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := database.DB

	result := db.Where("username = ?", user.Username).First(&foundUser)
	if result.Error != nil {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Username not found"})
		return
	}

	valid, err := verifyPassword(foundUser.Password, user.Password)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "Error verifying password, " + err.Error()})
		return
	}

	if !valid {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Invalid password"})
		return
	}

	fmt.Println("userid", user.ID)

	claims := &models.Claims{
		UserID:   foundUser.ID,
		Username: user.Username,
		Role:     foundUser.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString(jwtKey)

	c.IndentedJSON(http.StatusOK, gin.H{"token": tokenString})

}

func VerifyJWT(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Authorization header required"})
		return
	}
	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || parts[0] != "Bearer" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Authorization header format must be Bearer {token}"})
		return
	}
	tokenString := parts[1]
	claims, ok := CheckJWT(tokenString)
	if !ok {
		c.IndentedJSON(http.StatusOK, gin.H{
			"valid": false,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"valid":  true,
		"claims": claims,
	})
}
