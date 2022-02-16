package config

import (
	"errors"
	"os"
	"path/filepath"
	"time"

	"github.com/pelletier/go-toml"
)

var configDirFn = os.UserHomeDir
var readFileFn = os.ReadFile

const (
	ConfigDirName   = "/.deepsource/"
	ConfigFileName  = "/config.toml"
	DefaultHostName = "deepsource.io"
)

type CLIConfig struct {
	Host                  string
	User                  string
	Token                 string
	RefreshToken          string    `toml:",omitempty"`
	TokenExpiresIn        time.Time `toml:",omitempty"`
	RefreshTokenExpiresIn time.Time `toml:",omitempty"`
}

var Cfg CLIConfig

// Sets the token expiry in the desired format
func (cfg *CLIConfig) SetTokenExpiry(str string) {
	layout := "2006-01-02T15:04:05.999999999"
	t, _ := time.Parse(layout, str)
	timeStamp := t.Unix()
	cfg.TokenExpiresIn = time.Unix(timeStamp, 0)
}

// Checks if the token has expired or not
func (cfg CLIConfig) IsExpired() bool {
	if cfg.TokenExpiresIn.IsZero() {
		return true
	}
	return time.Now().After(cfg.TokenExpiresIn)
}

// configDir returns the directory to store the config file.
func (CLIConfig) configDir() (string, error) {
	home, err := configDirFn()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, ConfigDirName), nil
}

// configPath returns the file path to the config file.
func (cfg CLIConfig) configPath() (string, error) {
	home, err := cfg.configDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, ConfigFileName), nil
}

//ReadFile reads the CLI config file.
func (cfg *CLIConfig) ReadConfigFile() error {
	path, err := cfg.configPath()
	if err != nil {
		return err
	}

	// check if config exists
	_, err = os.Stat(path)
	if err != nil {
		return nil
	}

	data, err := readFileFn(path)
	if err != nil {
		return err
	}
	err = toml.Unmarshal(data, cfg)
	if err != nil {
		return err
	}

	return nil
}

func GetConfig() (*CLIConfig, error) {

	if Cfg.Token != "" {
		return &Cfg, nil
	}

	err := Cfg.ReadConfigFile()
	if err != nil {
		return &Cfg, err
	}
	return &Cfg, nil
}

// WriteFile writes the CLI config to file.
func (cfg *CLIConfig) WriteFile() error {

	data, err := toml.Marshal(cfg)
	if err != nil {
		return err
	}

	configDir, err := cfg.configDir()
	if err != nil {
		return err
	}

	if err := os.MkdirAll(configDir, os.ModePerm); err != nil {
		return err
	}

	path, err := cfg.configPath()
	if err != nil {
		return err
	}

	// Create file
	file, err := os.Create(path)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = file.Write(data)

	return err
}

// Deletes the config during logging out user
func (cfg *CLIConfig) Delete() error {
	path, err := cfg.configPath()
	if err != nil {
		return err
	}
	return os.Remove(path)
}

func (cfg *CLIConfig) VerifyAuthentication() error {

	// Checking if the user has authenticated / logged in or not
	if cfg.Token == "" {
		return errors.New("You are not logged into DeepSource. Run \"deepsource auth login\" to authenticate.")
	}

	return nil
}
