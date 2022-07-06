package push

import (
	"context"

	analyzerConfig "github.com/deepsourcelabs/cli/analyzers/config"
	"github.com/deepsourcelabs/cli/deepsource"
)

// syncAnalyzer uses the asgard public API to sync the Analyzer data with DeepSource.
func (a *AnalyzerPushOpts) syncAnalyzer(host, token string) (bool, []string, error) {
	var err error

	// Fetch the issues data.
	if a.IssuesData, err = analyzerConfig.GetIssueDescriptions(); err != nil {
		return false, []string{}, err
	}

	// Use the SDK for syncing the Analyzer through the public API.
	deepsource, err := deepsource.New(deepsource.ClientOpts{
		Token:    token,
		HostName: host,
	})
	if err != nil {
		return false, []string{}, err
	}

	ctx := context.Background()
	syncResponse, err := deepsource.SyncAnalyzer(ctx, &a.AnalyzerTOMLData, a.IssuesData)
	if err != nil {
		return false, []string{}, err
	}
	return syncResponse.Ok, syncResponse.Warnings, nil
}
