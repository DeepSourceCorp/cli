package auth

import (
	"context"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	dsauth "github.com/deepsourcelabs/cli/deepsource/auth"
	dsuser "github.com/deepsourcelabs/cli/deepsource/user"
)

// ClientFactory constructs a DeepSource API client.
type ClientFactory func(opts deepsource.ClientOpts) (*deepsource.Client, error)

// Service handles auth-related operations.
type Service struct {
	config    *config.Manager
	newClient ClientFactory
}

// NewService creates a new auth service.
func NewService(configMgr *config.Manager) *Service {
	return &Service{
		config:    configMgr,
		newClient: deepsource.New,
	}
}

// NewServiceWithFactory creates an auth service with a custom client factory.
func NewServiceWithFactory(configMgr *config.Manager, factory ClientFactory) *Service {
	return &Service{
		config:    configMgr,
		newClient: factory,
	}
}

func (s *Service) LoadConfig() (*config.CLIConfig, error) {
	return s.config.Load()
}

func (s *Service) SaveConfig(cfg *config.CLIConfig) error {
	return s.config.Write(cfg)
}

func (s *Service) DeleteConfig() error {
	return s.config.Delete()
}

func (s *Service) RegisterDevice(ctx context.Context, cfg *config.CLIConfig) (*dsauth.Device, error) {
	client, err := s.newClient(deepsource.ClientOpts{Token: cfg.Token, HostName: cfg.Host, InsecureSkipVerify: cfg.SkipTLSVerify})
	if err != nil {
		return nil, err
	}
	return client.RegisterDevice(ctx)
}

func (s *Service) RequestPAT(ctx context.Context, cfg *config.CLIConfig, deviceCode, description string) (*dsauth.PAT, error) {
	client, err := s.newClient(deepsource.ClientOpts{Token: cfg.Token, HostName: cfg.Host, InsecureSkipVerify: cfg.SkipTLSVerify})
	if err != nil {
		return nil, err
	}
	return client.Login(ctx, deviceCode, description)
}

func (s *Service) GetViewer(ctx context.Context, cfg *config.CLIConfig) (*dsuser.User, error) {
	client, err := s.newClient(deepsource.ClientOpts{Token: cfg.Token, HostName: cfg.Host, InsecureSkipVerify: cfg.SkipTLSVerify})
	if err != nil {
		return nil, err
	}
	return client.GetViewer(ctx)
}
