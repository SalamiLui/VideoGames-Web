package controllers

import (
	"APIlogin/models"

	"github.com/golang-jwt/jwt/v5"
)

var jwtKey = []byte("messiesgod")

func CheckJWT(tokenString string) (*models.Claims, bool) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return jwtKey, nil
	})
	if err != nil || !token.Valid {
		return nil, false
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, false
	}
	return &models.Claims{
		UserID:   uint(claims["user_id"].(float64)),
		Username: claims["username"].(string),
		Role:     claims["role"].(string),
	}, true
}
