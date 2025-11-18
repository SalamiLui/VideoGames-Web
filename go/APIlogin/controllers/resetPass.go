package controllers

import (
	"APIlogin/models"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"log"
	"net/smtp"
	"os"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

var resetTokenTTL = time.Hour

func generateToken(nBytes int) (string, error) {
	b := make([]byte, nBytes)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

func hashToken(token string) string {
	h := sha256.Sum256([]byte(token))
	return fmt.Sprintf("%x", h[:])
}

func sendResetMail(mail string, token string) error {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading env file")
	}
	var (
		smtpHost         = os.Getenv("SMTP_HOST")
		smtpUser         = os.Getenv("SMTP_USER")
		smtpPass         = os.Getenv("SMTP_PASS")
		resetFrontendURL = "http://localhost:3000/reset"
		fromEmail        = os.Getenv("SMTP_FROMEMAIL")
		smtpPort         = os.Getenv("SMTP_PORT")
	)

	resetLink := fmt.Sprintf("%s?token=%s", resetFrontendURL, token)

	subject := "Password Reset Request"
	body := fmt.Sprintf(
		"Sup bitch?,\n\n"+
			"U requested to reset your password. Click the link below to set a new one:\n\n%s\n\n"+
			"This link will expire in %s.\n\n"+
			"If u loose ur password again I'll beat the shit out of u \n"+
			"If you did not request a password reset, please ignore this email :).\n",
		resetLink, resetTokenTTL,
	)

	msg := "From: " + fromEmail + "\r\n" +
		"To: " + mail + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/plain; charset=\"utf-8\"\r\n" +
		"\r\n" +
		body

	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	return smtp.SendMail(smtpHost+":"+smtpPort, auth, fromEmail, []string{mail}, []byte(msg))
}

func changePassword(tx *gorm.DB, userID uint, hashedPw string, reset models.PasswordReset) error {

	if err := tx.Model(&models.User{}).Where("id = ?", userID).Update("password", string(hashedPw)).Error; err != nil {
		return err
	}
	reset.Used = true
	if err := tx.Save(&reset).Error; err != nil {
		return err
	}
	return nil

}
