package middleware

import (
	"APIlogin/controllers"
	"APIlogin/roles"
	"strings"

	"github.com/gin-gonic/gin"
)

func VerifyRole(expectedRole roles.Role) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(401, gin.H{"error": "Authorization header required"})
			return
		}
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(401, gin.H{"error": "Authorization header format must be Bearer {token}"})
			return
		}
		tokenString := parts[1]
		claims, ok := controllers.CheckJWT(tokenString)
		if !ok {
			c.AbortWithStatusJSON(401, gin.H{"error": "Invalid token / no authorization"})
			return
		}
		if claims.Role != string(expectedRole) {
			c.AbortWithStatusJSON(403, gin.H{"error": "Forbidden: insufficient permissions"})
			return
		}
		c.Set("claims", claims)
		c.Next()
	}
}
