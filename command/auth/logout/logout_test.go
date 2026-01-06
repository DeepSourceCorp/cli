package logout

import (
	"errors"
	"testing"

	"github.com/deepsourcelabs/cli/config"
	"github.com/stretchr/testify/assert"
)

func TestNewCmdLogout(t *testing.T) {
	t.Run("creates command with correct properties", func(t *testing.T) {
		cmd := NewCmdLogout()
		assert.Equal(t, "logout", cmd.Use)
		assert.Equal(t, "Logout of your active DeepSource account", cmd.Short)
	})
}

func TestLogoutOptions_Run(t *testing.T) {
	t.Run("error reading config", func(t *testing.T) {
		opts := &LogoutOptions{
			GetConfigFn: func() (*config.CLIConfig, error) {
				return nil, errors.New("config read error")
			},
			ConfirmFromUserFn: func(msg, helpText string) (bool, error) {
				return false, nil
			},
		}
		err := opts.Run()
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "Error while reading DeepSource CLI config")
	})

	t.Run("not logged in - empty token", func(t *testing.T) {
		opts := &LogoutOptions{
			GetConfigFn: func() (*config.CLIConfig, error) {
				return &config.CLIConfig{Token: ""}, nil
			},
			ConfirmFromUserFn: func(msg, helpText string) (bool, error) {
				return false, nil
			},
		}
		err := opts.Run()
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "not logged into DeepSource")
	})

	t.Run("user cancels logout", func(t *testing.T) {
		opts := &LogoutOptions{
			GetConfigFn: func() (*config.CLIConfig, error) {
				return &config.CLIConfig{Token: "valid_token"}, nil
			},
			ConfirmFromUserFn: func(msg, helpText string) (bool, error) {
				return false, nil // User cancels
			},
		}
		err := opts.Run()
		assert.NoError(t, err)
	})

	t.Run("confirmation prompt returns error", func(t *testing.T) {
		opts := &LogoutOptions{
			GetConfigFn: func() (*config.CLIConfig, error) {
				return &config.CLIConfig{Token: "valid_token"}, nil
			},
			ConfirmFromUserFn: func(msg, helpText string) (bool, error) {
				return false, errors.New("prompt error")
			},
		}
		err := opts.Run()
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "prompt error")
	})
}
