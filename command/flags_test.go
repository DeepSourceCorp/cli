package command

import (
	"testing"

	runsCmd "github.com/deepsourcelabs/cli/command/runs"
	issuesCmd "github.com/deepsourcelabs/cli/command/issues"
	metricsCmd "github.com/deepsourcelabs/cli/command/metrics"
	vulnsCmd "github.com/deepsourcelabs/cli/command/vulnerabilities"
	"github.com/spf13/cobra"
)

type flagExpectation struct {
	name         string
	defaultValue string
}

func TestFlagDefaults(t *testing.T) {
	tests := []struct {
		name      string
		buildCmd  func() *cobra.Command
		expected  []flagExpectation
	}{
		{
			name:     "issues",
			buildCmd: issuesCmd.NewCmdIssues,
			expected: []flagExpectation{
				{name: "limit", defaultValue: "30"},
				{name: "output", defaultValue: "pretty"},
				{name: "verbose", defaultValue: "false"},
				{name: "pr", defaultValue: "0"},
				{name: "commit", defaultValue: ""},
				{name: "repo", defaultValue: ""},
				{name: "severity", defaultValue: "[]"},
				{name: "category", defaultValue: "[]"},
				{name: "analyzer", defaultValue: "[]"},
				{name: "path", defaultValue: "[]"},
				{name: "source", defaultValue: "[]"},
				{name: "default-branch", defaultValue: "false"},
			},
		},
		{
			name:     "metrics",
			buildCmd: metricsCmd.NewCmdMetrics,
			expected: []flagExpectation{
				{name: "limit", defaultValue: "30"},
				{name: "output", defaultValue: "pretty"},
				{name: "verbose", defaultValue: "false"},
				{name: "pr", defaultValue: "0"},
				{name: "commit", defaultValue: ""},
				{name: "repo", defaultValue: ""},
			},
		},
		{
			name:     "vulnerabilities",
			buildCmd: vulnsCmd.NewCmdVulnerabilities,
			expected: []flagExpectation{
				{name: "limit", defaultValue: "100"},
				{name: "output", defaultValue: "pretty"},
				{name: "verbose", defaultValue: "false"},
				{name: "pr", defaultValue: "0"},
				{name: "commit", defaultValue: ""},
				{name: "repo", defaultValue: ""},
				{name: "severity", defaultValue: "[]"},
			},
		},
		{
			name:     "runs",
			buildCmd: runsCmd.NewCmdRuns,
			expected: []flagExpectation{
				{name: "limit", defaultValue: "20"},
				{name: "output", defaultValue: "pretty"},
				{name: "commit", defaultValue: ""},
				{name: "repo", defaultValue: ""},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cmd := tt.buildCmd()

			for _, exp := range tt.expected {
				flag := cmd.Flags().Lookup(exp.name)
				if flag == nil {
					t.Errorf("flag %q not found on command %q", exp.name, tt.name)
					continue
				}
				if flag.DefValue != exp.defaultValue {
					t.Errorf("flag %q on command %q: expected default %q, got %q",
						exp.name, tt.name, exp.defaultValue, flag.DefValue)
				}
			}
		})
	}
}
