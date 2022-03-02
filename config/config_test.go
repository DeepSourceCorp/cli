package config

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

var cfg = CLIConfig{
	Host:                  "deepsource.io",
	User:                  "test",
	Token:                 "test_token",
	RefreshToken:          "test_refresh_token",
	TokenExpiresIn:        time.Time{},
	RefreshTokenExpiresIn: time.Time{},
}

func TestSetTokenExpiry(t *testing.T) {
	t.Run("must reset with invalid timestamp", func(t *testing.T) {
		str := "invalid"
		cfg.SetTokenExpiry(str)
		want := "0001-01-01 00:00:00 +0000 UTC"

		assert.Equal(t, cfg.TokenExpiresIn.UTC().String(), want)
	})

	t.Run("must work with valid timestamp", func(t *testing.T) {
		str := "2021-01-01T00:00:00.999999999"
		cfg.SetTokenExpiry(str)
		want := "2021-01-01 00:00:00 +0000 UTC"

		assert.Equal(t, cfg.TokenExpiresIn.UTC().String(), want)
	})
}

func TestIsExpired(t *testing.T) {
	str := time.Now().UTC().Format("2006-01-02T15:04:05.999999999")
	cfg.SetTokenExpiry(str)
	result := cfg.IsExpired()
	assert.Equal(t, true, result)
}

func TestConfigDir(t *testing.T) {
	_, err := cfg.configDir()
	assert.Nil(t, err)
}

func TestConfigPath(t *testing.T) {
	_, err := cfg.configPath()
	assert.Nil(t, err)
}

func TestGetConfig(t *testing.T) {
	_, err := GetConfig()
	assert.Nil(t, err)
}

func TestVerifyAuthentication(t *testing.T) {
	t.Run("must return nil when token is provided", func(t *testing.T) {
		err := cfg.VerifyAuthentication()
		assert.Nil(t, err)
	})

	t.Run("must not return nil when empty token is provided", func(t *testing.T) {
		// set empty token
		cfg.Token = ""
		err := cfg.VerifyAuthentication()
		assert.NotNil(t, err)
	})
}
