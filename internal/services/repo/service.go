package repo

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/repository"
	"github.com/deepsourcelabs/cli/utils"
)

// Client defines the repo API used by the service.
type Client interface {
	GetRepoStatus(ctx context.Context, owner, repoName, provider string) (*repository.Meta, error)
}

// ClientFactory constructs a repo client.
type ClientFactory func(opts deepsource.ClientOpts) (Client, error)

// Service provides repository operations.
type Service struct {
	config        *config.Manager
	newClient     ClientFactory
	resolveRemote func(repoArg string) (*utils.RemoteData, error)
}

// NewService creates a repo service.
func NewService(configMgr *config.Manager) *Service {
	return &Service{
		config:        configMgr,
		newClient:     func(opts deepsource.ClientOpts) (Client, error) { return deepsource.New(opts) },
		resolveRemote: utils.ResolveRemote,
	}
}

// StatusResult holds repository status info.
type StatusResult struct {
	Remote    *utils.RemoteData
	Activated bool
	Host      string
}

// Status checks repository activation status.
func (s *Service) Status(ctx context.Context, repoArg string) (*StatusResult, error) {
	cfg, err := s.config.Load()
	if err != nil {
		return nil, fmt.Errorf("Error while reading DeepSource CLI config : %v", err)
	}
	if err := cfg.VerifyAuthentication(); err != nil {
		return nil, err
	}

	remote, err := s.resolveRemote(repoArg)
	if err != nil {
		return nil, err
	}

	client, err := s.newClient(deepsource.ClientOpts{Token: cfg.Token, HostName: cfg.Host})
	if err != nil {
		return nil, err
	}

	statusResponse, err := client.GetRepoStatus(ctx, remote.Owner, remote.RepoName, remote.VCSProvider)
	if err != nil {
		return nil, err
	}

	return &StatusResult{Remote: remote, Activated: statusResponse.Activated, Host: cfg.Host}, nil
}

// ViewURL validates access and returns the dashboard URL.
func (s *Service) ViewURL(ctx context.Context, repoArg string) (string, error) {
	cfg, err := s.config.Load()
	if err != nil {
		return "", fmt.Errorf("Error while reading DeepSource CLI config : %v", err)
	}
	if err := cfg.VerifyAuthentication(); err != nil {
		return "", err
	}

	remote, err := s.resolveRemote(repoArg)
	if err != nil {
		return "", err
	}

	client, err := s.newClient(deepsource.ClientOpts{Token: cfg.Token, HostName: cfg.Host})
	if err != nil {
		return "", err
	}

	_, err = client.GetRepoStatus(ctx, remote.Owner, remote.RepoName, remote.VCSProvider)
	if err != nil {
		if strings.Contains(err.Error(), "Signature has expired") {
			return "", errors.New("The token has expired. Please refresh the token using the command `deepsource auth refresh`")
		}
		if strings.Contains(err.Error(), "Repository matching query does not exist") {
			return "", errors.New("Unauthorized access. Please login if you haven't using the command `deepsource auth login`")
		}
		return "", err
	}

	vcsShortcode := vcsShortcode(remote.VCSProvider)
	if vcsShortcode == "" {
		return "", fmt.Errorf("Unknown VCS provider: %s", remote.VCSProvider)
	}

	return fmt.Sprintf("https://%s/%s/%s/%s/", cfg.Host, vcsShortcode, remote.Owner, remote.RepoName), nil
}

func vcsShortcode(provider string) string {
	switch provider {
	case "GITHUB":
		return "gh"
	case "GITHUB_ENTERPRISE":
		return "ghe"
	case "GITLAB":
		return "gl"
	case "BITBUCKET":
		return "bb"
	case "BITBUCKET_DATACENTER":
		return "bbdc"
	case "ADS":
		return "ads"
	default:
		return ""
	}
}
