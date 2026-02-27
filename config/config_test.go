package config

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

var cfg = CLIConfig{
	Host:           "deepsource.com",
	User:           "test",
	Token:          "test_token",
	TokenExpiresIn: time.Time{},
}

func TestSetTokenExpiry(t *testing.T) {
	t.Run("must reset with invalid timestamp", func(t *testing.T) {
		str := "invalid"
		cfg.SetTokenExpiry(str)
		want := "0001-01-01 00:00:00 +0000 UTC"

		assert.Equal(t, cfg.TokenExpiresIn.UTC().String(), want)
	})

	t.Run("must work with valid timestamp", func(t *testing.T) {
		str := "9999-12-31T23:59:59.999999+00:00"
		cfg.SetTokenExpiry(str)
		want := "9999-12-31 23:59:59.999999 +0000 UTC"

		assert.Equal(t, cfg.TokenExpiresIn.UTC().String(), want)
	})
}

func TestIsExpired(t *testing.T) {
	t.Run("expired when expiry is in the past", func(t *testing.T) {
		c := CLIConfig{Token: "tok"}
		c.SetTokenExpiry(time.Now().UTC().Add(-time.Hour).Format(time.RFC3339))
		assert.True(t, c.IsExpired())
	})

	t.Run("not expired when expiry is in the future", func(t *testing.T) {
		c := CLIConfig{Token: "tok"}
		c.SetTokenExpiry(time.Now().UTC().Add(time.Hour).Format(time.RFC3339))
		assert.False(t, c.IsExpired())
	})

	t.Run("not expired when token present but zero expiry", func(t *testing.T) {
		c := CLIConfig{Token: "env-token", TokenExpiresIn: time.Time{}}
		assert.False(t, c.IsExpired())
	})

	t.Run("not expired when no token and zero expiry", func(t *testing.T) {
		c := CLIConfig{Token: "", TokenExpiresIn: time.Time{}}
		assert.False(t, c.IsExpired())
	})
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
