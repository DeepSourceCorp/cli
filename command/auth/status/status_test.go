package status

import (
	"errors"
	"sync"
	"testing"
	"time"

	"github.com/deepsourcelabs/cli/config"
	"github.com/stretchr/testify/assert"
)

var mockMu sync.Mutex

func TestNewCmdStatus(t *testing.T) {
	t.Run("creates command with correct properties", func(t *testing.T) {
		cmd := NewCmdStatus()
		assert.Equal(t, "status", cmd.Use)
		assert.Equal(t, "View the authentication status", cmd.Short)
		assert.NotEmpty(t, cmd.Long)
	})
}

func TestAuthStatusOptions_Run(t *testing.T) {
	t.Run("error reading config", func(t *testing.T) {
		mockMu.Lock()
		originalGetConfig := getConfigFn
		getConfigFn = func() (*config.CLIConfig, error) {
			return nil, errors.New("config read error")
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			getConfigFn = originalGetConfig
			mockMu.Unlock()
		}()

		opts := AuthStatusOptions{}
		err := opts.Run()
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "Error while reading DeepSource CLI config")
	})

	t.Run("not logged in - empty token", func(t *testing.T) {
		mockMu.Lock()
		originalGetConfig := getConfigFn
		getConfigFn = func() (*config.CLIConfig, error) {
			return &config.CLIConfig{Token: ""}, nil
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			getConfigFn = originalGetConfig
			mockMu.Unlock()
		}()

		opts := AuthStatusOptions{}
		err := opts.Run()
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "not logged into DeepSource")
	})

	t.Run("logged in with valid token", func(t *testing.T) {
		mockMu.Lock()
		originalGetConfig := getConfigFn
		getConfigFn = func() (*config.CLIConfig, error) {
			return &config.CLIConfig{
				User:           "test@example.com",
				Token:          "valid_token",
				TokenExpiresIn: time.Now().Add(24 * time.Hour),
			}, nil
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			getConfigFn = originalGetConfig
			mockMu.Unlock()
		}()

		opts := AuthStatusOptions{}
		err := opts.Run()
		assert.NoError(t, err)
	})

	t.Run("logged in with expired token", func(t *testing.T) {
		mockMu.Lock()
		originalGetConfig := getConfigFn
		getConfigFn = func() (*config.CLIConfig, error) {
			return &config.CLIConfig{
				User:           "test@example.com",
				Token:          "expired_token",
				TokenExpiresIn: time.Now().Add(-24 * time.Hour),
			}, nil
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			getConfigFn = originalGetConfig
			mockMu.Unlock()
		}()

		opts := AuthStatusOptions{}
		err := opts.Run()
		assert.NoError(t, err)
	})
}
