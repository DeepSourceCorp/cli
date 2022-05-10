package analyzer

import (
	"github.com/spf13/cobra"

	initialize "github.com/deepsourcelabs/cli/command/analyzer/initialize"
	verify "github.com/deepsourcelabs/cli/command/analyzer/verify"
)

// Options holds the metadata.
type Options struct{}

// NewCmdVersion returns the current version of cli being used
func NewCmdAnalyzer() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "analyzer",
		Short: "Operations related to DeepSource Analyzers",
	}
	cmd.AddCommand(verify.NewCmdAnalyzerVerify())
	cmd.AddCommand(initialize.NewCmdAnalyzerInit())
	return cmd
}
