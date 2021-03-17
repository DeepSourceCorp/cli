package cmd

import (
	"github.com/deepsourcelabs/cli/pkg/analyze"
	"github.com/spf13/cobra"
)

type analysisCmd struct {
	cmd   *cobra.Command
	files string
	// changesetAnalysis boolean
}

// loginCmd represents the login command
func newAnalysisCmd() *cobra.Command {
	ac := &analysisCmd{}
	ac.cmd = &cobra.Command{
		Use:   "analyze",
		Short: "Run analysis on the code using DeepSource",
		Run:   ac.runAnalysisCmd,
	}

	// Run analysis on files specified by the user
	ac.cmd.Flags().StringVarP(&ac.files, "files", "f", ".", "Run analysis on files")
	return ac.cmd
}

func (ac *analysisCmd) runAnalysisCmd(cmd *cobra.Command, args []string) {
	analyze.RunAnalysis(ac.files)
}
