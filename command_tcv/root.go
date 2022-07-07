package commandtcv

import (
	"github.com/deepsourcelabs/cli/command/report"
	"github.com/spf13/cobra"
)

// NewCmdTCV returns a Cobra command containing commands related to test coverage reporting.
func NewCmdTCV() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "deepsource <command> <subcommand> [flags]",
		Short: "DeepSource CLI",
		Long: `Welcome to DeepSource CLI
Now ship good code directly from the command line.

Login into DeepSource using the command : deepsource auth login`,
		SilenceErrors: true,
		SilenceUsage:  true,
	}

	cmd.AddCommand(report.NewCmdReport())

	return cmd
}
