package config

import (
	"os"
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

var mockMu sync.Mutex

var cfg = CLIConfig{
	Host:           "deepsource.io",
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

func TestConfigWriteFile(t *testing.T) {
	t.Run("successful write", func(t *testing.T) {
		testCfg := CLIConfig{
			Host:  "deepsource.io",
			User:  "test",
			Token: "test_token",
		}
		err := testCfg.WriteFile()
		assert.Nil(t, err)
	})

	t.Run("error when tomlMarshal fails", func(t *testing.T) {
		// Save original function
		mockMu.Lock()
		originalTomlMarshalFn := tomlMarshalFn
		tomlMarshalFn = func(_ interface{}) ([]byte, error) {
			return nil, assert.AnError
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			tomlMarshalFn = originalTomlMarshalFn
			mockMu.Unlock()
		}()

		testCfg := CLIConfig{
			Host:  "deepsource.io",
			User:  "test",
			Token: "test_token",
		}
		err := testCfg.WriteFile()
		assert.NotNil(t, err)
		assert.Equal(t, assert.AnError, err)
	})

	t.Run("error when configDir fails", func(t *testing.T) {
		// Save original function
		mockMu.Lock()
		originalConfigDirFn := configDirFn
		configDirFn = func() (string, error) {
			return "", assert.AnError
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			configDirFn = originalConfigDirFn
			mockMu.Unlock()
		}()

		testCfg := CLIConfig{
			Host:  "deepsource.io",
			User:  "test",
			Token: "test_token",
		}
		err := testCfg.WriteFile()
		assert.NotNil(t, err)
		assert.Equal(t, assert.AnError, err)
	})

	t.Run("error when MkdirAll fails", func(t *testing.T) {
		// Save original functions
		mockMu.Lock()
		originalOsMkdirAllFn := osMkdirAllFn
		osMkdirAllFn = func(_ string, _ os.FileMode) error {
			return assert.AnError
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			osMkdirAllFn = originalOsMkdirAllFn
			mockMu.Unlock()
		}()

		testCfg := CLIConfig{
			Host:  "deepsource.io",
			User:  "test",
			Token: "test_token",
		}
		err := testCfg.WriteFile()
		assert.NotNil(t, err)
		assert.Equal(t, assert.AnError, err)
	})

	t.Run("error when configPath fails after MkdirAll", func(t *testing.T) {
		// Save original function
		mockMu.Lock()
		originalConfigDirFn := configDirFn
		// Mock configDirFn to succeed first time (for configDir) but fail second time (for configPath)
		callCount := 0
		configDirFn = func() (string, error) {
			callCount++
			if callCount == 1 {
				return t.TempDir(), nil
			}
			return "", assert.AnError
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			configDirFn = originalConfigDirFn
			mockMu.Unlock()
		}()

		testCfg := CLIConfig{
			Host:  "deepsource.io",
			User:  "test",
			Token: "test_token",
		}
		err := testCfg.WriteFile()
		assert.NotNil(t, err)
		assert.Equal(t, assert.AnError, err)
	})

	t.Run("error when WriteFile fails", func(t *testing.T) {
		mockMu.Lock()
		originalOsWriteFileFn := osWriteFileFn
		osWriteFileFn = func(_ string, _ []byte, _ os.FileMode) error {
			return assert.AnError
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			osWriteFileFn = originalOsWriteFileFn
			mockMu.Unlock()
		}()

		testCfg := CLIConfig{
			Host:  "deepsource.io",
			User:  "test",
			Token: "test_token",
		}
		err := testCfg.WriteFile()
		assert.NotNil(t, err)
		assert.Equal(t, assert.AnError, err)
	})
}
