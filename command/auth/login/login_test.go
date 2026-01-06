package login

import (
	"errors"
	"sync"
	"testing"
	"time"

	"github.com/deepsourcelabs/cli/config"
	"github.com/stretchr/testify/assert"
)

var mockMu sync.Mutex

func TestNewCmdLogin(t *testing.T) {
	t.Run("creates command with correct properties", func(t *testing.T) {
		cmd := NewCmdLogin()
		assert.Equal(t, "login", cmd.Use)
		assert.Equal(t, "Log in to DeepSource using Command Line Interface", cmd.Short)
		assert.NotEmpty(t, cmd.Long)
	})

	t.Run("has hostname flag", func(t *testing.T) {
		cmd := NewCmdLogin()
		flag := cmd.Flags().Lookup("hostname")
		assert.NotNil(t, flag)
		assert.Equal(t, "", flag.DefValue)
	})

	t.Run("has interactive flag", func(t *testing.T) {
		cmd := NewCmdLogin()
		flag := cmd.Flags().Lookup("interactive")
		assert.NotNil(t, flag)
		assert.Equal(t, "false", flag.DefValue)
	})

	t.Run("has with-token flag", func(t *testing.T) {
		cmd := NewCmdLogin()
		flag := cmd.Flags().Lookup("with-token")
		assert.NotNil(t, flag)
		assert.Equal(t, "", flag.DefValue)
	})
}

func TestLoginOptions_handleInteractiveLogin(t *testing.T) {
	t.Run("DeepSource Cloud selected - no hostname prompt", func(t *testing.T) {
		mockMu.Lock()
		originalSelect := selectFromOptionsFn
		selectFromOptionsFn = func(msg, helpText string, opts []string) (string, error) {
			return "DeepSource (deepsource.io)", nil
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			selectFromOptionsFn = originalSelect
			mockMu.Unlock()
		}()

		opts := LoginOptions{Interactive: true}
		err := opts.handleInteractiveLogin()
		assert.NoError(t, err)
		assert.Empty(t, opts.HostName)
	})

	t.Run("DeepSource Enterprise selected - prompts for hostname", func(t *testing.T) {
		mockMu.Lock()
		originalSelect := selectFromOptionsFn
		originalInput := getSingleLineInputFn

		selectFromOptionsFn = func(msg, helpText string, opts []string) (string, error) {
			return "DeepSource Enterprise", nil
		}
		getSingleLineInputFn = func(msg, helpText string) (string, error) {
			return "enterprise.example.com", nil
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			selectFromOptionsFn = originalSelect
			getSingleLineInputFn = originalInput
			mockMu.Unlock()
		}()

		opts := LoginOptions{Interactive: true}
		err := opts.handleInteractiveLogin()
		assert.NoError(t, err)
		assert.Equal(t, "enterprise.example.com", opts.HostName)
	})

	t.Run("error from account type selection", func(t *testing.T) {
		mockMu.Lock()
		originalSelect := selectFromOptionsFn
		selectFromOptionsFn = func(msg, helpText string, opts []string) (string, error) {
			return "", errors.New("selection error")
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			selectFromOptionsFn = originalSelect
			mockMu.Unlock()
		}()

		opts := LoginOptions{Interactive: true}
		err := opts.handleInteractiveLogin()
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "selection error")
	})

	t.Run("error from hostname input", func(t *testing.T) {
		mockMu.Lock()
		originalSelect := selectFromOptionsFn
		originalInput := getSingleLineInputFn

		selectFromOptionsFn = func(msg, helpText string, opts []string) (string, error) {
			return "DeepSource Enterprise", nil
		}
		getSingleLineInputFn = func(msg, helpText string) (string, error) {
			return "", errors.New("input error")
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			selectFromOptionsFn = originalSelect
			getSingleLineInputFn = originalInput
			mockMu.Unlock()
		}()

		opts := LoginOptions{Interactive: true}
		err := opts.handleInteractiveLogin()
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "input error")
	})
}

func TestLoginOptions_Run(t *testing.T) {
	t.Run("already authenticated user declines re-auth", func(t *testing.T) {
		mockMu.Lock()
		originalGetConfig := getConfigFn
		originalConfirm := confirmFromUserFn

		getConfigFn = func() (*config.CLIConfig, error) {
			return &config.CLIConfig{
				User:           "test@example.com",
				Token:          "valid_token",
				TokenExpiresIn: time.Now().Add(24 * time.Hour),
			}, nil
		}
		confirmFromUserFn = func(msg, helpText string) (bool, error) {
			return false, nil // User declines
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			getConfigFn = originalGetConfig
			confirmFromUserFn = originalConfirm
			mockMu.Unlock()
		}()

		opts := LoginOptions{TokenExpired: false}
		err := opts.Run()
		assert.NoError(t, err)
	})

	t.Run("confirmation prompt returns error", func(t *testing.T) {
		mockMu.Lock()
		originalGetConfig := getConfigFn
		originalConfirm := confirmFromUserFn

		getConfigFn = func() (*config.CLIConfig, error) {
			return &config.CLIConfig{
				User:           "test@example.com",
				Token:          "valid_token",
				TokenExpiresIn: time.Now().Add(24 * time.Hour),
			}, nil
		}
		confirmFromUserFn = func(msg, helpText string) (bool, error) {
			return false, errors.New("prompt error")
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			getConfigFn = originalGetConfig
			confirmFromUserFn = originalConfirm
			mockMu.Unlock()
		}()

		opts := LoginOptions{TokenExpired: false}
		err := opts.Run()
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "Error in fetching response")
	})

	t.Run("interactive login error is propagated", func(t *testing.T) {
		mockMu.Lock()
		originalGetConfig := getConfigFn
		originalSelect := selectFromOptionsFn

		getConfigFn = func() (*config.CLIConfig, error) {
			return &config.CLIConfig{
				TokenExpiresIn: time.Now().Add(-24 * time.Hour), // Expired token
			}, nil
		}
		selectFromOptionsFn = func(msg, helpText string, opts []string) (string, error) {
			return "", errors.New("interactive error")
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			getConfigFn = originalGetConfig
			selectFromOptionsFn = originalSelect
			mockMu.Unlock()
		}()

		opts := LoginOptions{Interactive: true}
		err := opts.Run()
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "interactive error")
	})

	t.Run("custom hostname is stored", func(t *testing.T) {
		mockMu.Lock()
		originalGetConfig := getConfigFn
		originalConfirm := confirmFromUserFn

		var capturedCfg *config.CLIConfig
		getConfigFn = func() (*config.CLIConfig, error) {
			capturedCfg = &config.CLIConfig{
				TokenExpiresIn: time.Now().Add(24 * time.Hour),
				User:           "test@example.com",
				Token:          "valid_token",
			}
			return capturedCfg, nil
		}
		confirmFromUserFn = func(msg, helpText string) (bool, error) {
			return false, nil // User declines re-auth
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			getConfigFn = originalGetConfig
			confirmFromUserFn = originalConfirm
			mockMu.Unlock()
		}()

		opts := LoginOptions{HostName: "custom.deepsource.io"}
		err := opts.Run()
		assert.NoError(t, err)
		assert.Equal(t, "custom.deepsource.io", capturedCfg.Host)
	})
}
