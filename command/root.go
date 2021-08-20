package command

import (
	"github.com/deepsourcelabs/cli/command/auth"
	"github.com/deepsourcelabs/cli/command/config"
	"github.com/deepsourcelabs/cli/command/issues"
	"github.com/deepsourcelabs/cli/command/repo"
	"github.com/deepsourcelabs/cli/command/report"
	"github.com/deepsourcelabs/cli/command/version"
	"github.com/spf13/cobra"
)

func NewCmdRoot() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "deepsource <command> <subcommand> [flags]",
		Short: "DeepSource CLI",
		Long: `Welcome to DeepSource CLI
Now ship good code directly from the command line.

Login into DeepSource using the command : deepsource auth login`,
		SilenceErrors: true,
		SilenceUsage:  true,
	}

	// Child Commands
	cmd.AddCommand(version.NewCmdVersion())
	cmd.AddCommand(config.NewCmdConfig())
	cmd.AddCommand(auth.NewCmdAuth())
	cmd.AddCommand(repo.NewCmdRepo())
	cmd.AddCommand(issues.NewCmdIssues())
	cmd.AddCommand(report.NewCmdReport())

	return cmd
}

func Execute() error {
	cmd := NewCmdRoot()
	if err := cmd.Execute(); err != nil {
		return err
	}
	return nil
}
