package config

import (
	"errors"
	"time"
)

const (
	ConfigDirName   = "/.deepsource/"
	ConfigFileName  = "/config.toml"
	DefaultHostName = "deepsource.com"
)

type CLIConfig struct {
	Host           string    `toml:"host"`
	User           string    `toml:"user"`
	Token          string    `toml:"token"`
	TokenExpiresIn time.Time `toml:"token_expires_in,omitempty"`
}

// Sets the token expiry in the desired format
// Sets the token expiry in the desired format
func (cfg *CLIConfig) SetTokenExpiry(str string) {
	t, _ := time.Parse(time.RFC3339, str)
	cfg.TokenExpiresIn = t.UTC()
}

// Checks if the token has expired or not
func (cfg CLIConfig) IsExpired() bool {
	if cfg.TokenExpiresIn.IsZero() {
		return true
	}
	return time.Now().After(cfg.TokenExpiresIn)
}

func (cfg *CLIConfig) VerifyAuthentication() error {
	if cfg.Token == "" {
		return errors.New("You are not logged into DeepSource. Run \"deepsource auth login\" to authenticate.")
	}
	return nil
}
