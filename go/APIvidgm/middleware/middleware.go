package middleware

import (
	"APIvdgm/roles"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

type VerifyResponse struct {
	Valid  bool   `json:"valid"`
	Claims Claims `json:"claims"`
}

func VerifyJWT() gin.HandlerFunc {
	return func(c *gin.Context) {

		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing Authorization header"})
			c.Abort()
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Authorization header"})
			c.Abort()
			return
		}

		url := "http://localhost:8081/verify"

		req, err := http.NewRequest("GET", url, bytes.NewBuffer([]byte{}))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating verification request"})
			c.Abort()
			return
		}
		req.Header.Set("Authorization", "Bearer "+token)
		client := &http.Client{Timeout: 3 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Auth service unreachable"})
			c.Abort()
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			c.JSON(http.StatusUnauthorized, gin.H{"error": fmt.Sprintf("Invalid token: %s", string(body))})
			c.Abort()
			return
		}
		var verifyResp VerifyResponse
		if err := json.NewDecoder(resp.Body).Decode(&verifyResp); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding auth response"})
			c.Abort()
			return
		}

		if !verifyResp.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token not valid"})
			c.Abort()
			return
		}

		c.Set("claims", verifyResp.Claims)

		c.Next()
	}
}

func GetClaims(c *gin.Context) (Claims, bool) {
	v, ok := c.Get("claims")
	if !ok {
		return Claims{}, false
	}
	if Claims, ok := v.(Claims); ok {
		return Claims, true
	}
	return Claims{}, false
}

func CheckAuthExpectedUser(c *gin.Context, userID uint) error {
	claim, ok := GetClaims(c)
	if !ok {
		return fmt.Errorf("No claims")
	}
	if claim.UserID != userID {
		return fmt.Errorf("Access Denied, user mismatch")
	}
	return nil
}

func CheckAuthExpectedMinRole(c *gin.Context, expectedRole roles.Role) error {
	claim, ok := GetClaims(c)
	if !ok {
		return fmt.Errorf("No claims")
	}
	if !roles.HasAtLeast(roles.Role(claim.Role), expectedRole) {
		return fmt.Errorf("Access Denied, insufficient role")
	}
	return nil

}
