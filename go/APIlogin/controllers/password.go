package controllers

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"strings"

	"golang.org/x/crypto/argon2"
)

var (
	argonTime    uint32 = 2
	argonMemory  uint32 = 19 * 1024
	argonThreads uint8  = 1
	argonKeyLen  uint32 = 32
	saltLen             = 16
)

func genSalt(n int) ([]byte, error) {
	s := make([]byte, n)
	_, err := io.ReadFull(rand.Reader, s)
	if err != nil {
		return nil, err
	}
	return s, nil
}

func hashPassword(password string) (string, error) {
	salt, err := genSalt(saltLen)
	if err != nil {
		return "", err
	}
	hash := argon2.IDKey([]byte(password), salt, argonTime, argonMemory, argonThreads, argonKeyLen)

	b64Salt := base64.RawStdEncoding.EncodeToString(salt)
	b64Hash := base64.RawStdEncoding.EncodeToString(hash)

	encoded := fmt.Sprintf("$argon2id$v=19$m=%d,t=%d,p=%d$%s$%s",
		argonMemory, argonTime, argonThreads, b64Salt, b64Hash)

	return encoded, nil
}

func verifyPassword(encodedHash, password string) (bool, error) {

	parts := strings.Split(encodedHash, "$")
	if len(parts) != 6 {
		return false, errors.New("hash format inválido")
	}

	var memory, time, threads int
	_, err := fmt.Sscanf(parts[3], "m=%d,t=%d,p=%d", &memory, &time, &threads)
	if err != nil {
		return false, err
	}

	salt, err := base64.RawStdEncoding.DecodeString(parts[4])
	if err != nil {
		return false, err
	}

	hash, err := base64.RawStdEncoding.DecodeString(parts[5])
	if err != nil {
		return false, err
	}

	computed := argon2.IDKey([]byte(password), salt, uint32(time), uint32(memory), uint8(threads), uint32(len(hash)))

	if len(computed) != len(hash) {
		return false, nil
	}
	var diff byte
	for i := 0; i < len(hash); i++ {
		diff |= computed[i] ^ hash[i]
	}
	return diff == 0, nil
}
