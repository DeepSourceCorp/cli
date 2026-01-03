package config

import (
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

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
		originalTomlMarshalFn := tomlMarshalFn
		defer func() { tomlMarshalFn = originalTomlMarshalFn }()

		// Mock tomlMarshalFn to return an error
		tomlMarshalFn = func(v interface{}) ([]byte, error) {
			return nil, assert.AnError
		}

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
		originalConfigDirFn := configDirFn
		defer func() { configDirFn = originalConfigDirFn }()

		// Mock configDirFn to return an error
		configDirFn = func() (string, error) {
			return "", assert.AnError
		}

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
		originalOsMkdirAllFn := osMkdirAllFn
		defer func() { osMkdirAllFn = originalOsMkdirAllFn }()

		// Mock osMkdirAllFn to return an error
		osMkdirAllFn = func(path string, perm os.FileMode) error {
			return assert.AnError
		}

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
		originalConfigDirFn := configDirFn
		defer func() { configDirFn = originalConfigDirFn }()

		// Mock configDirFn to succeed first time (for configDir) but fail second time (for configPath)
		callCount := 0
		configDirFn = func() (string, error) {
			callCount++
			if callCount == 1 {
				return t.TempDir(), nil
			}
			return "", assert.AnError
		}

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
		// Save original function
		originalOsWriteFileFn := osWriteFileFn
		defer func() { osWriteFileFn = originalOsWriteFileFn }()

		// Mock osWriteFileFn to return an error
		osWriteFileFn = func(name string, data []byte, perm os.FileMode) error {
			return assert.AnError
		}

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
