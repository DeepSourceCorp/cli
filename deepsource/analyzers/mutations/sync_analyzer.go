package analyzers

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/analyzers"
	"github.com/deepsourcelabs/cli/types"
	"github.com/deepsourcelabs/graphql"
)

// GraphQL query to sync a custom Analyzer with DeepSource.
const syncAnalyzerMutation = `
mutation SyncAnalyzer($input:SyncAnalyzerInput!) {
	syncAnalyzer(input:$input) {
        ok
        warnings
	}
}`

type AnalyzerInput struct {
	Name             string   `json:"name"`
	Version          string   `json:"version"`
	Shortcode        string   `json:"shortcode"`
	Description      string   `json:"description,omitempty"`
	Tags             []string `json:"tags,omitempty"`
	RepositoryUrl    string   `json:"repositoryUrl,omitempty"`
	DocumentationUrl string   `json:"documentationUrl,omitempty"`
	BugTrackerUrl    string   `json:"bugtrackerUrl,omitempty"`
	AnalysisCommand  string   `json:"analysisCommand"`
	AutofixCommand   string   `json:"autofixCommand,omitempty"`
}

type SyncAnalyzerInput struct {
	Analyzer AnalyzerInput         `json:"analyzer"`
	Issues   []types.AnalyzerIssue `json:"issues"`
}

type SyncAnalyzerRequest struct {
	Input SyncAnalyzerInput
}

// GraphQL interface of API client.
type IGQLClient interface {
	GQL() *graphql.Client
	GetToken() string
}

func (s SyncAnalyzerRequest) Do(ctx context.Context, client IGQLClient) (*analyzers.SyncResponse, error) {
	req := graphql.NewRequest(syncAnalyzerMutation)
	// Add request variables.
	req.Var("input", s.Input)

	// Set header fields.
	req.Header.Set("Cache-Control", "no-cache")
	tokenHeader := fmt.Sprintf("Bearer %s", client.GetToken())
	req.Header.Add("Authorization", tokenHeader)

	// Run the mutation and capture the response.
	var respData analyzers.SyncResponse
	if err := client.GQL().Run(ctx, req, &respData); err != nil {
		return nil, err
	}
	return &respData, nil
}
