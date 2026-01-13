package config

import (
	"errors"
	"os"
	"path/filepath"

	"github.com/deepsourcelabs/cli/internal/adapters"
	"github.com/deepsourcelabs/cli/internal/interfaces"
	"github.com/deepsourcelabs/cli/internal/secrets"
	"github.com/pelletier/go-toml"
	"gopkg.in/yaml.v3"
)

// Manager handles reading and writing CLI config.
type Manager struct {
	fs         interfaces.FileSystem
	homeDir    func() (string, error)
	secrets    secrets.Store
	secretsKey string
}

// NewManager creates a config manager with injected dependencies.
func NewManager(fs interfaces.FileSystem, homeDir func() (string, error)) *Manager {
	return NewManagerWithSecrets(fs, homeDir, secrets.NoopStore{}, "")
}

// NewManagerWithSecrets creates a config manager with a secrets store.
func NewManagerWithSecrets(fs interfaces.FileSystem, homeDir func() (string, error), store secrets.Store, key string) *Manager {
	if key == "" {
		key = "deepsource-cli-token"
	}
	if store == nil {
		store = secrets.NoopStore{}
	}
	return &Manager{fs: fs, homeDir: homeDir, secrets: store, secretsKey: key}
}

// DefaultManager returns a manager using OS-backed dependencies.
func DefaultManager() *Manager {
	return NewManagerWithSecrets(adapters.NewOSFileSystem(), os.UserHomeDir, secrets.DefaultStore(), "")
}

func (m *Manager) configDir() (string, error) {
	home, err := m.homeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, ConfigDirName), nil
}

func (m *Manager) configPath() (string, error) {
	configDir, err := m.configDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(configDir, ConfigFileName), nil
}

func (m *Manager) configYAMLPath() (string, error) {
	home, err := m.homeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, ".deepsource-cli.yaml"), nil
}

func (m *Manager) configYAMLAltPath() (string, error) {
	home, err := m.homeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, ".deepsource-cli.yml"), nil
}

// Load reads the CLI config file if it exists.
func (m *Manager) Load() (*CLIConfig, error) {
	cfg := &CLIConfig{}
	yamlPath, err := m.configYAMLPath()
	if err != nil {
		return cfg, err
	}
	yamlAltPath, err := m.configYAMLAltPath()
	if err != nil {
		return cfg, err
	}
	tomlPath, err := m.configPath()
	if err != nil {
		return cfg, err
	}

	if exists, err := m.exists(yamlPath); err != nil {
		return cfg, err
	} else if exists {
		return m.readYAML(cfg, yamlPath)
	}

	if exists, err := m.exists(yamlAltPath); err != nil {
		return cfg, err
	} else if exists {
		return m.readYAML(cfg, yamlAltPath)
	}

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
		if token, err := m.secrets.Get(m.secretsKey); err == nil {
			cfg.Token = token
		}
	}

	return cfg, nil
}

// Write persists the CLI config file.
func (m *Manager) Write(cfg *CLIConfig) error {
	cfgToWrite := *cfg
	if cfg.Token != "" {
		if err := m.secrets.Set(m.secretsKey, cfg.Token); err == nil {
			cfgToWrite.Token = ""
		}
	}
	yamlPath, err := m.configYAMLPath()
	if err != nil {
		return err
	}
	yamlAltPath, err := m.configYAMLAltPath()
	if err != nil {
		return err
	}

	if exists, err := m.exists(yamlPath); err != nil {
		return err
	} else if exists {
		return m.writeYAML(&cfgToWrite, yamlPath)
	}

	if exists, err := m.exists(yamlAltPath); err != nil {
		return err
	} else if exists {
		return m.writeYAML(&cfgToWrite, yamlAltPath)
	}

	data, err := toml.Marshal(&cfgToWrite)
	if err != nil {
		return err
	}

	configDir, err := m.configDir()
	if err != nil {
		return err
	}

	if err := m.fs.MkdirAll(configDir, os.ModePerm); err != nil {
		return err
	}

	path, err := m.configPath()
	if err != nil {
		return err
	}

	return m.fs.WriteFile(path, data, 0o644)
}

// Delete removes the CLI config file if it exists.
func (m *Manager) Delete() error {
	if err := m.secrets.Delete(m.secretsKey); err != nil && !errors.Is(err, secrets.ErrNotFound) && !errors.Is(err, secrets.ErrUnavailable) {
		return err
	}
	paths := []func() (string, error){
		m.configYAMLPath,
		m.configYAMLAltPath,
		m.configPath,
	}

	for _, pathFn := range paths {
		path, err := pathFn()
		if err != nil {
			return err
		}
		if err := m.fs.Remove(path); err != nil && !errors.Is(err, os.ErrNotExist) {
			return err
		}
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

func (m *Manager) readYAML(cfg *CLIConfig, path string) (*CLIConfig, error) {
	data, err := m.fs.ReadFile(path)
	if err != nil {
		return cfg, err
	}
	if err := yaml.Unmarshal(data, cfg); err != nil {
		return cfg, err
	}
	return cfg, nil
}

func (m *Manager) writeYAML(cfg *CLIConfig, path string) error {
	data, err := yaml.Marshal(cfg)
	if err != nil {
		return err
	}
	return m.fs.WriteFile(path, data, 0o644)
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
