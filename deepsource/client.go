// DeepSource SDK
package deepsource

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/analyzers"
	analyzerQuery "github.com/deepsourcelabs/cli/deepsource/analyzers/queries"
	"github.com/deepsourcelabs/cli/deepsource/auth"
	authmut "github.com/deepsourcelabs/cli/deepsource/auth/mutations"
	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/deepsource/issues"
	issuesQuery "github.com/deepsourcelabs/cli/deepsource/issues/queries"
	"github.com/deepsourcelabs/cli/deepsource/metrics"
	metricsQuery "github.com/deepsourcelabs/cli/deepsource/metrics/queries"
	"github.com/deepsourcelabs/cli/deepsource/vulnerabilities"
	vulnerabilitiesQuery "github.com/deepsourcelabs/cli/deepsource/vulnerabilities/queries"
	"github.com/deepsourcelabs/cli/deepsource/repository"
	repoQuery "github.com/deepsourcelabs/cli/deepsource/repository/queries"
	"github.com/deepsourcelabs/cli/deepsource/runs"
	runsQuery "github.com/deepsourcelabs/cli/deepsource/runs/queries"
	"github.com/deepsourcelabs/cli/deepsource/codeformatters"
	codeformatterQuery "github.com/deepsourcelabs/cli/deepsource/codeformatters/queries"
	"github.com/deepsourcelabs/cli/deepsource/user"
	userQuery "github.com/deepsourcelabs/cli/deepsource/user/queries"
	"github.com/deepsourcelabs/graphql"
)

var defaultHostName = "deepsource.com"

type ClientOpts struct {
	Token    string
	HostName string

	// OnTokenRefreshed is called after a successful automatic token refresh.
	// If set, enables transparent token refresh when API calls fail due to
	// expired tokens. The callback should persist the new credentials.
	OnTokenRefreshed func(token, expiry, email string)
}

type Client struct {
	gql        *graphql.Client
	gqlWrapper graphqlclient.GraphQLClient
	token      string
}

// Returns a GraphQL client which can be used to interact with the GQL APIs
func (c Client) GQL() *graphql.Client {
	return c.gql
}

// Returns the PAT which is required for authentication and thus, interacting with the APIs
func (c Client) GetToken() string {
	return c.token
}

// NewWithGraphQLClient creates a Client that uses the given GraphQL client
// directly. Intended for tests where a MockClient provides canned responses.
func NewWithGraphQLClient(gql graphqlclient.GraphQLClient) *Client {
	return &Client{gqlWrapper: gql}
}

// Returns a new GQLClient
func New(cp ClientOpts) (*Client, error) {
	apiClientURL := getAPIClientURL(cp.HostName)
	gql := graphql.NewClient(apiClientURL)

	c := &Client{
		gql:   gql,
		token: cp.Token,
	}

	if cp.OnTokenRefreshed != nil {
		c.gqlWrapper = graphqlclient.NewWithClientAndRefresher(gql, cp.Token, func(ctx context.Context, currentToken string) (string, error) {
			pat, err := c.RefreshAuthCreds(ctx, currentToken)
			if err != nil {
				return "", err
			}
			cp.OnTokenRefreshed(pat.Token, pat.Expiry, pat.User.Email)
			return pat.Token, nil
		})
	} else {
		c.gqlWrapper = graphqlclient.NewWithClient(gql, cp.Token)
	}

	return c, nil
}

// // Formats and returns the DeepSource Public API client URL
func getAPIClientURL(hostName string) string {
	apiClientURL := fmt.Sprintf("https://api.%s/graphql/", defaultHostName)

	// Check if the domain is different from the default domain (In case of Enterprise users)
	if hostName != defaultHostName {
		apiClientURL = fmt.Sprintf("https://%s/api/graphql/", hostName)
	}
	return apiClientURL
}

// Registers the device and allots it a device code which is further used for fetching
// the PAT and other authentication data
func (c Client) RegisterDevice(ctx context.Context) (*auth.Device, error) {
	req := authmut.NewRegisterDeviceRequest(c.gqlWrapper)
	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

// Logs in the client using the deviceCode and the user Code and returns the PAT and data which is required for authentication
func (c Client) Login(ctx context.Context, deviceCode, description string) (*auth.PAT, error) {
	req := authmut.NewRequestPATRequest(c.gqlWrapper, authmut.RequestPATParams{
		DeviceCode:  deviceCode,
		Description: description,
	})

	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

// Refreshes the authentication credentials. Takes the refreshToken as a parameter.
func (c Client) RefreshAuthCreds(ctx context.Context, token string) (*auth.PAT, error) {
	req := authmut.NewRefreshTokenRequest(c.gqlWrapper, authmut.RefreshTokenParams{
		Token: token,
	})
	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

// Returns the list of Analyzers supported by DeepSource along with their meta like shortcode, metaschema.
func (c Client) GetSupportedAnalyzers(ctx context.Context) ([]analyzers.Analyzer, error) {
	req := analyzerQuery.NewAnalyzersRequest(c.gqlWrapper)
	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

// Returns the list of CodeFormatters supported by DeepSource along with their meta like shortcode.
func (c Client) GetSupportedCodeFormatters(ctx context.Context) ([]codeformatters.CodeFormatter, error) {
	req := codeformatterQuery.NewCodeFormattersRequest(c.gqlWrapper)
	res, err := req.Do(ctx)
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
	req := repoQuery.NewRepoStatusRequest(c.gqlWrapper, repoQuery.RepoStatusParams{
		Owner:    owner,
		RepoName: repoName,
		Provider: provider,
	})
	res, err := req.Do(ctx)
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
	req := issuesQuery.NewIssuesListRequest(c.gqlWrapper, issuesQuery.IssuesListParams{
		Owner:    owner,
		RepoName: repoName,
		Provider: provider,
		Limit:    limit,
	})
	res, err := req.Do(ctx)
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
	req := issuesQuery.NewFileIssuesListRequest(c.gqlWrapper, issuesQuery.FileIssuesListParams{
		Owner:    owner,
		RepoName: repoName,
		Provider: provider,
		FilePath: filePath,
		Limit:    limit,
	})
	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

// Returns details of the authenticated user.
func (c Client) GetViewer(ctx context.Context) (*user.User, error) {
	req := userQuery.NewViewerRequest(c.gqlWrapper)
	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

// Returns the list of analysis runs for a repository.
// owner : The username of the owner of the repository
// repoName : The name of the repository
// provider : The VCS provider which hosts the repo (GITHUB/GITLAB/BITBUCKET)
// limit : The number of analysis runs to fetch
// after : Cursor for pagination (nil for first page)
func (c Client) GetAnalysisRuns(ctx context.Context, owner, repoName, provider string, limit int, after *string) ([]runs.AnalysisRun, runsQuery.PageInfo, error) {
	req := runsQuery.NewAnalysisRunsListRequest(c.gqlWrapper, runsQuery.AnalysisRunsListParams{
		Owner:    owner,
		RepoName: repoName,
		Provider: provider,
		Limit:    limit,
		After:    after,
	})
	res, pageInfo, err := req.Do(ctx)
	if err != nil {
		return nil, runsQuery.PageInfo{}, err
	}
	return res, pageInfo, nil
}

// Returns the issues for a specific analysis run.
// commitOid : The commit OID of the analysis run
func (c Client) GetRunIssues(ctx context.Context, commitOid string) (*runs.RunWithIssues, error) {
	req := runsQuery.NewRunIssuesRequest(c.gqlWrapper, runsQuery.RunIssuesParams{
		CommitOid: commitOid,
	})
	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

// Returns issues for a specific run as a flat list (for issues --commit).
func (c Client) GetRunIssuesFlat(ctx context.Context, commitOid string, limit int, filters issuesQuery.RunIssuesFlatParams) ([]issues.Issue, error) {
	filters.CommitOid = commitOid
	filters.Limit = limit
	req := issuesQuery.NewRunIssuesFlatRequest(c.gqlWrapper, filters)
	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

// Returns issues for a specific pull request.
func (c Client) GetPRIssues(ctx context.Context, owner, repoName, provider string, prNumber, limit int) ([]issues.Issue, error) {
	req := issuesQuery.NewPRIssuesListRequest(c.gqlWrapper, issuesQuery.PRIssuesListParams{
		Owner:    owner,
		RepoName: repoName,
		Provider: provider,
		PRNumber: prNumber,
		Limit:    limit,
	})
	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

// Returns metrics for a repository's default branch.
func (c Client) GetRepoMetrics(ctx context.Context, owner, repoName, provider string) ([]metrics.RepositoryMetric, error) {
	req := metricsQuery.NewRepoMetricsRequest(c.gqlWrapper, metricsQuery.RepoMetricsParams{
		Owner:    owner,
		RepoName: repoName,
		Provider: provider,
	})
	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

// Returns metrics for a specific analysis run.
func (c Client) GetRunMetrics(ctx context.Context, commitOid string) (*metrics.RunMetrics, error) {
	req := metricsQuery.NewRunMetricsRequest(c.gqlWrapper, metricsQuery.RunMetricsParams{
		CommitOid: commitOid,
	})
	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

// Returns metrics for a specific pull request.
func (c Client) GetPRMetrics(ctx context.Context, owner, repoName, provider string, prNumber int) (*metrics.PRMetrics, error) {
	req := metricsQuery.NewPRMetricsRequest(c.gqlWrapper, metricsQuery.PRMetricsParams{
		Owner:    owner,
		RepoName: repoName,
		Provider: provider,
		PRNumber: prNumber,
	})
	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

// Returns vulnerabilities for a repository's default branch.
func (c Client) GetRepoVulns(ctx context.Context, owner, repoName, provider string, limit int) ([]vulnerabilities.VulnerabilityOccurrence, error) {
	req := vulnerabilitiesQuery.NewRepoVulnsRequest(c.gqlWrapper, vulnerabilitiesQuery.RepoVulnsParams{
		Owner:    owner,
		RepoName: repoName,
		Provider: provider,
		Limit:    limit,
	})
	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

// Returns vulnerabilities for a specific analysis run.
func (c Client) GetRunVulns(ctx context.Context, commitOid string, limit int) (*vulnerabilities.RunVulns, error) {
	req := vulnerabilitiesQuery.NewRunVulnsRequest(c.gqlWrapper, vulnerabilitiesQuery.RunVulnsParams{
		CommitOid: commitOid,
		Limit:     limit,
	})
	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

// Returns the list of enabled analyzers for a repository.
func (c Client) GetEnabledAnalyzers(ctx context.Context, owner, repoName, provider string) ([]analyzers.Analyzer, error) {
	req := repoQuery.NewEnabledAnalyzersRequest(c.gqlWrapper, repoQuery.EnabledAnalyzersParams{
		Owner:    owner,
		RepoName: repoName,
		Provider: provider,
	})
	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

// Returns the branch name for a specific pull request.
func (c Client) GetPRBranch(ctx context.Context, owner, repoName, provider string, prNumber int) (string, error) {
	req := runsQuery.NewPRBranchRequest(c.gqlWrapper, runsQuery.PRBranchParams{
		Owner:    owner,
		RepoName: repoName,
		Provider: provider,
		PRNumber: prNumber,
	})
	return req.Do(ctx)
}

// Returns vulnerabilities for a specific pull request.
func (c Client) GetPRVulns(ctx context.Context, owner, repoName, provider string, prNumber, limit int) (*vulnerabilities.PRVulns, error) {
	req := vulnerabilitiesQuery.NewPRVulnsRequest(c.gqlWrapper, vulnerabilitiesQuery.PRVulnsParams{
		Owner:    owner,
		RepoName: repoName,
		Provider: provider,
		PRNumber: prNumber,
		Limit:    limit,
	})
	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}
