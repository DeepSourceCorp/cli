package config

import (
	"errors"
	"os"
	"path/filepath"

	"github.com/deepsourcelabs/cli/buildinfo"
	"github.com/deepsourcelabs/cli/internal/adapters"
	"github.com/deepsourcelabs/cli/internal/debug"
	"github.com/deepsourcelabs/cli/internal/interfaces"
	"github.com/pelletier/go-toml"
)

// Manager handles reading and writing CLI config.
type Manager struct {
	fs      interfaces.FileSystem
	homeDir func() (string, error)
}

// NewManager creates a config manager with injected dependencies.
func NewManager(fs interfaces.FileSystem, homeDir func() (string, error)) *Manager {
	return &Manager{fs: fs, homeDir: homeDir}
}

// DefaultManager returns a manager using OS-backed dependencies.
func DefaultManager() *Manager {
	return NewManager(adapters.NewOSFileSystem(), os.UserHomeDir)
}

func (m *Manager) configDir() (string, error) {
	home, err := m.homeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, buildinfo.ConfigDirName), nil
}

func (m *Manager) configPath() (string, error) {
	configDir, err := m.configDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(configDir, ConfigFileName), nil
}

// Load reads the CLI config file if it exists.
func (m *Manager) Load() (*CLIConfig, error) {
	cfg := &CLIConfig{}
	tomlPath, err := m.configPath()
	if err != nil {
		return cfg, err
	}
	debug.Log("config: loading from %s", tomlPath)

	if exists, err := m.exists(tomlPath); err != nil {
		return cfg, err
	} else if exists {
		data, err := m.fs.ReadFile(tomlPath)
		if err != nil {
			return cfg, err
		}

		if err := toml.Unmarshal(data, cfg); err != nil {
			return cfg, err
		}
	}

	if cfg.Token == "" {
		if envToken := os.Getenv("DEEPSOURCE_TOKEN"); envToken != "" {
			cfg.Token = envToken
			cfg.TokenFromEnv = true
		}
	}
	if cfg.Host == "" {
		if envHost := os.Getenv("DEEPSOURCE_HOST"); envHost != "" {
			cfg.Host = envHost
		}
	}

	debug.Log("config: host=%q user=%q token_present=%v env=%v", cfg.Host, cfg.User, cfg.Token != "", cfg.TokenFromEnv)

	return cfg, nil
}

// Write persists the CLI config file.
func (m *Manager) Write(cfg *CLIConfig) error {
	data, err := toml.Marshal(cfg)
	if err != nil {
		return err
	}

	configDir, err := m.configDir()
	if err != nil {
		return err
	}

	if err := m.fs.MkdirAll(configDir, 0o700); err != nil {
		return err
	}

	path, err := m.configPath()
	if err != nil {
		return err
	}

	return m.fs.WriteFile(path, data, 0o600)
}

// Delete removes the CLI config file if it exists.
func (m *Manager) Delete() error {
	path, err := m.configPath()
	if err != nil {
		return err
	}
	if err := m.fs.Remove(path); err != nil && !errors.Is(err, os.ErrNotExist) {
		return err
	}

	return nil
}

func (m *Manager) exists(path string) (bool, error) {
	_, err := m.fs.Stat(path)
	if err == nil {
		return true, nil
	}
	if errors.Is(err, os.ErrNotExist) {
		return false, nil
	}
	return false, err
}

// TokenRefreshCallback returns a callback that persists refreshed token
// credentials. Intended for use with deepsource.ClientOpts.OnTokenRefreshed.
func (m *Manager) TokenRefreshCallback() func(token, expiry, email string) {
	return func(token, expiry, email string) {
		cfg, err := m.Load()
		if err != nil {
			return
		}
		if cfg.TokenFromEnv {
			return
		}
		cfg.Token = token
		cfg.SetTokenExpiry(expiry)
		cfg.User = email
		_ = m.Write(cfg)
	}
}

// GetConfig loads the config using OS-backed defaults.
func GetConfig() (*CLIConfig, error) {
	return DefaultManager().Load()
}

// WriteConfig writes the config using OS-backed defaults.
func WriteConfig(cfg *CLIConfig) error {
	return DefaultManager().Write(cfg)
}

// DeleteConfig removes the config using OS-backed defaults.
func DeleteConfig() error {
	return DefaultManager().Delete()
}
