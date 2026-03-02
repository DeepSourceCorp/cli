package deepsource

import (
	"context"
	"crypto/tls"
	"fmt"
	"net/http"

	"github.com/deepsourcelabs/cli/deepsource/analyzers"
	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/internal/debug"
	analyzerQuery "github.com/deepsourcelabs/cli/deepsource/analyzers/queries"
	"github.com/deepsourcelabs/cli/deepsource/auth"
	authmut "github.com/deepsourcelabs/cli/deepsource/auth/mutations"
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

	// InsecureSkipVerify disables TLS certificate verification.
	// Use for self-hosted instances with self-signed certificates.
	InsecureSkipVerify bool

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

func (c Client) GQL() *graphql.Client {
	return c.gql
}

func (c Client) GetToken() string {
	return c.token
}

// NewWithGraphQLClient creates a Client that uses the given GraphQL client
// directly. Intended for tests where a MockClient provides canned responses.
func NewWithGraphQLClient(gql graphqlclient.GraphQLClient) *Client {
	return &Client{gqlWrapper: gql}
}

func New(cp ClientOpts) (*Client, error) {
	apiClientURL := getAPIClientURL(cp.HostName)

	var base http.RoundTripper = http.DefaultTransport
	if cp.InsecureSkipVerify {
		base = &http.Transport{
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: true, //nolint:gosec // user-requested for self-signed certs
				MinVersion:         tls.VersionTLS12,
			},
		}
	}
	httpClient := &http.Client{
		Transport: &graphqlclient.StatusCheckTransport{Base: base},
	}
	gql := graphql.NewClient(apiClientURL, graphql.WithHTTPClient(httpClient))

	debug.Log("client: API endpoint %s", apiClientURL)

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

// normalizeHostName maps known aliases for the DeepSource cloud host back to
// the canonical "deepsource.com". Users may have legacy or alternate hostnames
// in their config (e.g. "deepsource.io" or "app.deepsource.com").
func normalizeHostName(hostName string) string {
	switch hostName {
	case "deepsource.io", "app.deepsource.com":
		return defaultHostName
	default:
		return hostName
	}
}

func getAPIClientURL(hostName string) string {
	hostName = normalizeHostName(hostName)
	apiClientURL := fmt.Sprintf("https://api.%s/graphql/", defaultHostName)

	if hostName != defaultHostName {
		apiClientURL = fmt.Sprintf("https://%s/api/graphql/", hostName)
	}
	return apiClientURL
}

func (c Client) RegisterDevice(ctx context.Context) (*auth.Device, error) {
	req := authmut.NewRegisterDeviceRequest(c.gqlWrapper)
	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

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

func (c Client) GetSupportedAnalyzers(ctx context.Context) ([]analyzers.Analyzer, error) {
	req := analyzerQuery.NewAnalyzersRequest(c.gqlWrapper)
	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (c Client) GetSupportedCodeFormatters(ctx context.Context) ([]codeformatters.CodeFormatter, error) {
	req := codeformatterQuery.NewCodeFormattersRequest(c.gqlWrapper)
	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

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

// Auto-paginates to fetch all results.
func (c Client) GetIssues(ctx context.Context, owner, repoName, provider string) ([]issues.Issue, error) {
	req := issuesQuery.NewIssuesListRequest(c.gqlWrapper, issuesQuery.IssuesListParams{
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

// Auto-paginates to fetch all results.
func (c Client) GetIssuesForFile(ctx context.Context, owner, repoName, provider, filePath string) ([]issues.Issue, error) {
	req := issuesQuery.NewFileIssuesListRequest(c.gqlWrapper, issuesQuery.FileIssuesListParams{
		Owner:    owner,
		RepoName: repoName,
		Provider: provider,
		FilePath: filePath,
	})
	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (c Client) GetViewer(ctx context.Context) (*user.User, error) {
	req := userQuery.NewViewerRequest(c.gqlWrapper)
	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (c Client) GetAnalysisRuns(ctx context.Context, owner, repoName, provider string, limit int, after *string, branchName *string) ([]runs.AnalysisRun, runsQuery.PageInfo, error) {
	req := runsQuery.NewAnalysisRunsListRequest(c.gqlWrapper, runsQuery.AnalysisRunsListParams{
		Owner:      owner,
		RepoName:   repoName,
		Provider:   provider,
		Limit:      limit,
		After:      after,
		BranchName: branchName,
	})
	res, pageInfo, err := req.Do(ctx)
	if err != nil {
		return nil, runsQuery.PageInfo{}, err
	}
	return res, pageInfo, nil
}

// Returns nil (not an error) if no run exists for the given commit.
func (c Client) GetRunByCommit(ctx context.Context, commitOid string) (*runs.AnalysisRun, error) {
	req := runsQuery.NewGetRunRequest(c.gqlWrapper, runsQuery.GetRunParams{
		CommitOid: commitOid,
	})
	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

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

// Auto-paginates nested results.
func (c Client) GetRunIssuesFlat(ctx context.Context, commitOid string, filters issuesQuery.RunIssuesFlatParams) ([]issues.Issue, error) {
	filters.CommitOid = commitOid
	req := issuesQuery.NewRunIssuesFlatRequest(c.gqlWrapper, filters)
	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

// Auto-paginates to fetch all results.
func (c Client) GetPRIssues(ctx context.Context, owner, repoName, provider string, prNumber int, filters issuesQuery.PRIssuesListParams) ([]issues.Issue, error) {
	filters.Owner = owner
	filters.RepoName = repoName
	filters.Provider = provider
	filters.PRNumber = prNumber
	req := issuesQuery.NewPRIssuesListRequest(c.gqlWrapper, filters)
	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

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

// Auto-paginates to fetch all results.
func (c Client) GetRepoVulns(ctx context.Context, owner, repoName, provider string) ([]vulnerabilities.VulnerabilityOccurrence, error) {
	req := vulnerabilitiesQuery.NewRepoVulnsRequest(c.gqlWrapper, vulnerabilitiesQuery.RepoVulnsParams{
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

func (c Client) GetRunVulns(ctx context.Context, commitOid string) (*vulnerabilities.RunVulns, error) {
	req := vulnerabilitiesQuery.NewRunVulnsRequest(c.gqlWrapper, vulnerabilitiesQuery.RunVulnsParams{
		CommitOid: commitOid,
	})
	res, err := req.Do(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

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

func (c Client) GetPRBranch(ctx context.Context, owner, repoName, provider string, prNumber int) (string, error) {
	req := runsQuery.NewPRBranchRequest(c.gqlWrapper, runsQuery.PRBranchParams{
		Owner:    owner,
		RepoName: repoName,
		Provider: provider,
		PRNumber: prNumber,
	})
	return req.Do(ctx)
}

// Returns found=false when no PR exists or the PR is not open.
func (c Client) GetPRForBranch(ctx context.Context, owner, repoName, provider, branch string) (prNumber int, found bool, err error) {
	req := runsQuery.NewPRByBranchRequest(c.gqlWrapper, runsQuery.PRByBranchParams{
		Owner:    owner,
		RepoName: repoName,
		Provider: provider,
		Branch:   branch,
	})
	number, state, ok, err := req.Do(ctx)
	if err != nil {
		return 0, false, err
	}
	if !ok || state != "OPEN" {
		return 0, false, nil
	}
	return number, true, nil
}

// Auto-paginates to fetch all results.
func (c Client) GetPRVulns(ctx context.Context, owner, repoName, provider string, prNumber int) (*vulnerabilities.PRVulns, error) {
	req := vulnerabilitiesQuery.NewPRVulnsRequest(c.gqlWrapper, vulnerabilitiesQuery.PRVulnsParams{
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
