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
	"gorm.io/gorm"
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

func RequestReset(c *gin.Context) {
	var user models.User
	db := database.DB
	var req struct {
		Mail string `json:"mail"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(400, gin.H{"error": err.Error()})
		return
	}

	token, err := generateToken(32)
	if err != nil {
		c.IndentedJSON(500, gin.H{"error": err.Error()})
		return
	}
	hashToken := hashToken(token)

	if result := db.Where("mail = ?", req.Mail).First(&user); result.Error != nil {
		c.IndentedJSON(200, gin.H{"message": "if email address exists, an email will be sended "})
		return
	}

	var passRes models.PasswordReset
	expDate := time.Now().Add(resetTokenTTL)
	passRes.TokenHash = hashToken
	passRes.ExpiresAt = expDate
	passRes.CreatedAt = time.Now()
	passRes.Used = false
	passRes.UserID = user.ID

	if result := db.Create(&passRes); result.Error != nil {
		c.IndentedJSON(500, gin.H{"error": result.Error.Error()})
		return
	}
	err = sendResetMail(user.Mail, token)
	if err != nil {
		c.IndentedJSON(500, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(200, gin.H{"message": "if email address exists, an email will be sended "})

}

func ResetPassword(c *gin.Context) {
	db := database.DB
	var body struct {
		Token    string `json:"token" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "invalid data"})
		return
	}
	tokenHash := hashToken(body.Token)
	var reset models.PasswordReset
	if err := db.Where("token_hash = ?", tokenHash).First(&reset).Error; err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "invalid token"})
		return
	}
	if reset.Used {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "token already used"})
		return
	}
	if time.Now().After(reset.ExpiresAt) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "expired token"})
		return
	}

	hashedPassword, err := hashPassword(body.Password)
	if err != nil {
		c.IndentedJSON(500, gin.H{"error": "error hashing password"})
		return
	}
	err = db.Transaction(func(tx *gorm.DB) error {
		return changePassword(tx, reset.UserID, hashedPassword, reset)
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error changing password"})
		return
	}
	c.IndentedJSON(200, gin.H{"message": "password changed succesfully"})

}
