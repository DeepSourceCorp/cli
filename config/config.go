package config

import (
	"time"

	clierrors "github.com/deepsourcelabs/cli/internal/errors"
)

const (
	ConfigFileName  = "/config.toml"
	DefaultHostName = "deepsource.com"
)

type CLIConfig struct {
	Host           string    `toml:"host"`
	User           string    `toml:"user"`
	Token          string    `toml:"token"`
	TokenExpiresIn time.Time `toml:"token_expires_in,omitempty"`
SkipTLSVerify  bool      `toml:"skip_tls_verify,omitempty"`
	TokenFromEnv   bool      `toml:"-"`
}

func (cfg *CLIConfig) SetTokenExpiry(str string) {
	t, _ := time.Parse(time.RFC3339, str)
	cfg.TokenExpiresIn = t.UTC()
}

func (cfg *CLIConfig) IsExpired() bool {
	if cfg.TokenExpiresIn.IsZero() {
		return false
	}
	return time.Now().After(cfg.TokenExpiresIn)
}

func (cfg *CLIConfig) VerifyAuthentication() error {
	if cfg.Token == "" {
		return clierrors.ErrNotLoggedIn()
	}
	return nil
}

// NewDefault returns a CLIConfig with the default host set.
// Use this when Load() fails and a zero-value config is needed.
func NewDefault() *CLIConfig {
	return &CLIConfig{Host: DefaultHostName}
}
