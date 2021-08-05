// DeepSource SDK
package deepsource

import (
	"context"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource/analyzers"
	analyzerQuery "github.com/deepsourcelabs/cli/deepsource/analyzers/queries"
	"github.com/deepsourcelabs/cli/deepsource/auth"
	authmut "github.com/deepsourcelabs/cli/deepsource/auth/mutations"
	"github.com/deepsourcelabs/cli/deepsource/issues"
	issuesQuery "github.com/deepsourcelabs/cli/deepsource/issues/queries"
	"github.com/deepsourcelabs/cli/deepsource/repo"
	repoQuery "github.com/deepsourcelabs/cli/deepsource/repo/queries"
	"github.com/deepsourcelabs/cli/deepsource/transformers"
	transformerQuery "github.com/deepsourcelabs/cli/deepsource/transformers/queries"
	"github.com/deepsourcelabs/graphql"
)

const host = "https://api.deepsource.io/graphql/"

type Client struct {
	gql *graphql.Client
}

func (c Client) GQL() *graphql.Client {
	return c.gql
}

func (c Client) GetToken() string {
	return config.Token
}

func New() *Client {
	gql := graphql.NewClient(host)
	return &Client{
		gql: gql,
	}
}

func (c Client) RegisterDevice(ctx context.Context) (*auth.Device, error) {
	req := authmut.RegisterDeviceRequest{}
	res, err := req.Do(ctx, c)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (c Client) Login(ctx context.Context, deviceCode string) (*auth.JWT, error) {
	req := authmut.RequestJWTRequest{
		Params: authmut.RequestJWTParams{
			DeviceCode: deviceCode,
		},
	}

	res, err := req.Do(ctx, c)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (c Client) RefreshAuthCreds(ctx context.Context, refreshToken string) (*auth.RefreshAuthResponse, error) {
	req := authmut.RefreshTokenRequest{
		Params: authmut.RefreshTokenParams{
			RefreshToken: refreshToken,
		},
	}
	res, err := req.Do(ctx, c)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (c Client) GetSupportedAnalyzers(ctx context.Context) ([]analyzers.Analyzer, error) {

	req := analyzerQuery.AnalyzersRequest{}
	res, err := req.Do(ctx, c)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (c Client) GetSupportedTransformers(ctx context.Context) ([]transformers.Transformer, error) {

	req := transformerQuery.TransformersRequest{}
	res, err := req.Do(ctx, c)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (c Client) GetRepoStatus(ctx context.Context, owner, repoName, provider string) (*repo.Repository, error) {

	req := repoQuery.RepoStatusRequest{
		Params: repoQuery.RepoStatusParams{
			Owner:    owner,
			RepoName: repoName,
			Provider: provider,
		},
	}

	res, err := req.Do(ctx, c)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (c Client) GetIssues(ctx context.Context, owner, repoName, provider string, limit int) ([]issues.Issue, error) {

	req := issuesQuery.IssuesListRequest{
		Params: issuesQuery.IssuesListParams{
			Owner:    owner,
			RepoName: repoName,
			Provider: provider,
			Limit:    limit,
		},
	}
	res, err := req.Do(ctx, c)
	if err != nil {
		return nil, err
	}

	return res, nil
}

func (c Client) GetIssuesForFile(ctx context.Context, owner, repoName, provider, filePath string, limit int) ([]issues.Issue, error) {

	req := issuesQuery.FileIssuesListRequest{
		Params: issuesQuery.FileIssuesListParams{
			Owner:    owner,
			RepoName: repoName,
			Provider: provider,
			FilePath: filePath,
			Limit:    limit,
		},
	}

	res, err := req.Do(ctx, c)
	if err != nil {
		return nil, err
	}
	return res, nil
}
