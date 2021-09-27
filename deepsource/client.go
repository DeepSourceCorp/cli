// DeepSource SDK
package deepsource

import (
	"context"
	"fmt"
	"strings"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource/analyzers"
	analyzerQuery "github.com/deepsourcelabs/cli/deepsource/analyzers/queries"
	"github.com/deepsourcelabs/cli/deepsource/auth"
	authmut "github.com/deepsourcelabs/cli/deepsource/auth/mutations"
	"github.com/deepsourcelabs/cli/deepsource/issues"
	issuesQuery "github.com/deepsourcelabs/cli/deepsource/issues/queries"
	"github.com/deepsourcelabs/cli/deepsource/repository"
	repoQuery "github.com/deepsourcelabs/cli/deepsource/repository/queries"
	"github.com/deepsourcelabs/cli/deepsource/transformers"
	transformerQuery "github.com/deepsourcelabs/cli/deepsource/transformers/queries"
	"github.com/deepsourcelabs/graphql"
)

type Client struct {
	gql *graphql.Client
}

// Returns a GraphQL client which can be used to interact with the GQL APIs
func (c Client) GQL() *graphql.Client {
	return c.gql
}

// Returns the jWT which is required for authentication and thus, interacting with the APIs
func (c Client) GetToken() string {
	return config.Cfg.Token
}

// Returns a new GQLClient
func New() (*Client, error) {
	apiClientURL := fmt.Sprintf("https://api.%s/graphql/", config.DefaultHostName)
	if isEnterprise() {
		apiClientURL = fmt.Sprintf("https://%s/api/graphql/", config.Cfg.Host)
	}
	gql := graphql.NewClient(apiClientURL)
	return &Client{
		gql: gql,
	}, nil
}

// Checks whether the host is an enterprise host
func isEnterprise() bool {
	if strings.HasSuffix(config.Cfg.Host, "."+config.DefaultHostName) && config.Cfg.Host != config.DefaultHostName {
		return true
	}
	return false
}

// Registers the device and allots it a device code which is further used for fetching
// the JWT and other authentication data
func (c Client) RegisterDevice(ctx context.Context) (*auth.Device, error) {
	req := authmut.RegisterDeviceRequest{}
	res, err := req.Do(ctx, c)
	if err != nil {
		return nil, err
	}
	return res, nil
}

// Logs in the client using the deviceCode and the user Code and returns the JWT, RefreshToken and other
// data which is required for authentication
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

// Refreshes the authentication credentials. Takes the refreshToken as a parameter.
func (c Client) RefreshAuthCreds(ctx context.Context, refreshToken string) (*auth.JWT, error) {
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

// Returns the list of Analyzers supported by DeepSource along with their meta like shortcode, metaschema.
func (c Client) GetSupportedAnalyzers(ctx context.Context) ([]analyzers.Analyzer, error) {
	req := analyzerQuery.AnalyzersRequest{}
	res, err := req.Do(ctx, c)
	if err != nil {
		return nil, err
	}
	return res, nil
}

// Returns the list of Transformers supported by DeepSource along with their meta like shortcode.
func (c Client) GetSupportedTransformers(ctx context.Context) ([]transformers.Transformer, error) {
	req := transformerQuery.TransformersRequest{}
	res, err := req.Do(ctx, c)
	if err != nil {
		return nil, err
	}
	return res, nil
}

// Returns the activation status of the repository whose data is sent as parameters.
// Owner : The username of the owner of the repository
// repoName : The name of the repository whose activation status has to be queried
// provider : The VCS provider which hosts the repo (GITHUB/GITLAB/BITBUCKET)
func (c Client) GetRepoStatus(ctx context.Context, owner, repoName, provider string) (*repository.Meta, error) {
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

// Returns the list of issues for a certain repository whose data is sent as parameters.
// Owner : The username of the owner of the repository
// repoName : The name of the repository whose activation status has to be queried
// provider : The VCS provider which hosts the repo (GITHUB/GITLAB/BITBUCKET)
// limit : The amount of issues to be listed. The default limit is 30 while the maximum limit is currently 100.
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

// Returns the list of issues reported for a certain file in a certain repository whose data is sent as parameters.
// Owner : The username of the owner of the repository
// repoName : The name of the repository whose activation status has to be queried
// provider : The VCS provider which hosts the repo (GITHUB/GITLAB/BITBUCKET)
// filePath : The relative path of the file. Eg: "tests/mock.py" if a file `mock.py` is present in `tests` directory which in turn is present in the root dir
// limit : The amount of issues to be listed. The default limit is 30 while the maximum limit is currently 100.
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
