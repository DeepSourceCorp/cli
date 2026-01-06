package refresh

import (
	"errors"
	"sync"
	"testing"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/stretchr/testify/assert"
)

var mockMu sync.Mutex

func TestNewCmdRefresh(t *testing.T) {
	t.Run("creates command with correct properties", func(t *testing.T) {
		cmd := NewCmdRefresh()
		assert.Equal(t, "refresh", cmd.Use)
		assert.Equal(t, "Refresh stored authentication credentials", cmd.Short)
		assert.NotEmpty(t, cmd.Long)
	})
}

func TestRefreshOptions_Run(t *testing.T) {
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

		opts := RefreshOptions{}
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

		opts := RefreshOptions{}
		err := opts.Run()
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "not logged into DeepSource")
	})

	t.Run("error creating deepsource client", func(t *testing.T) {
		mockMu.Lock()
		originalGetConfig := getConfigFn
		originalNewDS := newDeepsourceFn

		getConfigFn = func() (*config.CLIConfig, error) {
			return &config.CLIConfig{Token: "valid_token"}, nil
		}
		newDeepsourceFn = func(opts deepsource.ClientOpts) (*deepsource.Client, error) {
			return nil, errors.New("client creation failed")
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			getConfigFn = originalGetConfig
			newDeepsourceFn = originalNewDS
			mockMu.Unlock()
		}()

		opts := RefreshOptions{}
		err := opts.Run()
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "client creation failed")
	})
}
