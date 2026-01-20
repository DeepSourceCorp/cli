package issues

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/issues"
	"github.com/deepsourcelabs/cli/internal/vcs"
)

// Client defines the API used for fetching issues.
type Client interface {
	GetIssues(ctx context.Context, owner, repoName, provider string, limit int) ([]issues.Issue, error)
}

// ClientFactory constructs an API client.
type ClientFactory func(opts deepsource.ClientOpts) (Client, error)

// Service provides issue operations.
type Service struct {
	config        *config.Manager
	newClient     ClientFactory
	resolveRemote func(repoArg string) (*vcs.RemoteData, error)
}

// NewService creates an issues service.
func NewService(configMgr *config.Manager) *Service {
	return &Service{
		config:        configMgr,
		newClient:     func(opts deepsource.ClientOpts) (Client, error) { return deepsource.New(opts) },
		resolveRemote: vcs.ResolveRemote,
	}
}

// ListOptions defines list filters.
type ListOptions struct {
	RepoArg      string
	FileArgs     []string
	AnalyzerArgs []string
	Limit        int
}

// ListResult is the issues response payload.
type ListResult struct {
	Issues []issues.Issue
	Remote *vcs.RemoteData
}

// List fetches issues for a repository and applies filters.
func (s *Service) List(ctx context.Context, opts ListOptions) (*ListResult, error) {
	cfg, err := s.config.Load()
	if err != nil {
		return nil, fmt.Errorf("Error while reading DeepSource CLI config : %v", err)
	}
	if err := cfg.VerifyAuthentication(); err != nil {
		return nil, err
	}

	remote, err := s.resolveRemote(opts.RepoArg)
	if err != nil {
		return nil, err
	}

	client, err := s.newClient(deepsource.ClientOpts{Token: cfg.Token, HostName: cfg.Host})
	if err != nil {
		return nil, err
	}

	issuesData, err := client.GetIssues(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, opts.Limit)
	if err != nil {
		return nil, err
	}

	filtered := issuesData
	if len(opts.FileArgs) != 0 {
		var fetched []issues.Issue
		for _, arg := range opts.FileArgs {
			matched, err := FilterIssuesByPath(arg, filtered)
			if err != nil {
				return nil, err
			}
			fetched = append(fetched, matched...)
		}
		filtered = UniqueIssues(fetched)
	}

	if len(opts.AnalyzerArgs) != 0 {
		matched, err := FilterIssuesByAnalyzer(opts.AnalyzerArgs, filtered)
		if err != nil {
			return nil, err
		}
		filtered = UniqueIssues(matched)
	}

	return &ListResult{Issues: filtered, Remote: remote}, nil
}
