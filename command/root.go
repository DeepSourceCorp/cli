package command

import (
	"github.com/deepsourcelabs/cli/command/auth"
	"github.com/deepsourcelabs/cli/command/config"
	"github.com/deepsourcelabs/cli/command/issues"
	"github.com/deepsourcelabs/cli/command/repo"
	"github.com/deepsourcelabs/cli/command/report"
	"github.com/deepsourcelabs/cli/command/version"
	cliConfig "github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/global"
	"github.com/pterm/pterm"
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

	// Config operations
	var cfg cliConfig.CLIConfig

	// Read the DeepSource config file
	configData, err := cfg.ReadFile()
	if err != nil {
		global.Token = ""
		global.RefreshToken = ""
		global.User = ""
	} else {
		// Populating the global package with the config data
		global.Token = configData.Token
		global.RefreshToken = configData.RefreshToken
		global.User = configData.User
	}

	// Check if token expired
	if global.Token != "" {
		global.TokenExpired = cfg.IsExpired()
		if global.TokenExpired {
			pterm.Info.Println("The authentication has expired. Please refresh the token using `deepsource auth refresh`")
		}
	}

	cmd := NewCmdRoot()
	if err := cmd.Execute(); err != nil {
		return err
	}
	return nil
}
