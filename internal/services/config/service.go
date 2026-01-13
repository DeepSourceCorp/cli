package config

import (
	"context"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	cliconfig "github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/internal/adapters"
	"github.com/deepsourcelabs/cli/internal/interfaces"
	"github.com/deepsourcelabs/cli/utils"
)

// Service encapsulates config-related workflows.
type Service struct {
	config    *cliconfig.Manager
	newClient func(opts deepsource.ClientOpts) (*deepsource.Client, error)
	fs        interfaces.FileSystem
	workdir   func() (string, error)
}

// NewService creates a config service with OS-backed dependencies.
func NewService(configMgr *cliconfig.Manager) *Service {
	return &Service{
		config:    configMgr,
		newClient: deepsource.New,
		fs:        adapters.NewOSFileSystem(),
		workdir:   os.Getwd,
	}
}

// LoadConfig loads and verifies authentication.
func (s *Service) LoadConfig() (*cliconfig.CLIConfig, error) {
	cfg, err := s.config.Load()
	if err != nil {
		return nil, fmt.Errorf("Error while reading DeepSource CLI config : %v", err)
	}
	if err := cfg.VerifyAuthentication(); err != nil {
		return nil, err
	}
	return cfg, nil
}

// FetchAnalyzersAndTransformersData populates utils caches for generator/validator.
func (s *Service) FetchAnalyzersAndTransformersData(ctx context.Context, cfg *cliconfig.CLIConfig) error {
	client, err := s.newClient(deepsource.ClientOpts{Token: cfg.Token, HostName: cfg.Host})
	if err != nil {
		return err
	}
	return utils.GetAnalyzersAndTransformersData(ctx, *client)
}

// FindConfigPath locates .deepsource.toml in current or repo root.
func (s *Service) FindConfigPath() (string, error) {
	cwd, err := s.workdir()
	if err != nil {
		return "", errors.New("Error occured while fetching current working directory. Exiting...")
	}

	configPath := filepath.Join(cwd, ".deepsource.toml")
	if _, err = s.fs.Stat(configPath); err == nil {
		return configPath, nil
	}

	output, err := exec.Command("git", "rev-parse", "--show-toplevel").Output()
	if err != nil {
		return "", err
	}
	root := strings.TrimRight(string(output), "\000\n")

	configPath = filepath.Join(root, ".deepsource.toml")
	if _, err := s.fs.Stat(configPath); err != nil {
		return "", errors.New("Error occured while looking for DeepSource config file. Exiting...")
	}
	return configPath, nil
}
