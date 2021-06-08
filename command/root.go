package command

import (
	"fmt"

	"github.com/deepsourcelabs/cli/api"
	"github.com/deepsourcelabs/cli/cmdutils"
	"github.com/deepsourcelabs/cli/command/auth"
	"github.com/deepsourcelabs/cli/command/config"
	"github.com/deepsourcelabs/cli/command/issues"
	"github.com/deepsourcelabs/cli/command/repo"
	"github.com/deepsourcelabs/cli/command/report"
	"github.com/deepsourcelabs/cli/command/version"
	cliConfig "github.com/deepsourcelabs/cli/internal/config"
	"github.com/spf13/cobra"
)

func NewCmdRoot(cmdFactory *cmdutils.CLIFactory) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "deepsource <command> <subcommand> [flags]",
		Short: "DeepSource CLI",
		Long: `Welcome to DeepSource CLI
Now ship good code directly from the command line.

Login into DeepSource using the command : deepsource auth login`,
	}
	cmd.AddCommand(version.NewCmdVersion())
	cmd.AddCommand(config.NewCmdConfig(cmdFactory))
	cmd.AddCommand(auth.NewCmdAuth(cmdFactory))
	cmd.AddCommand(repo.NewCmdRepo(cmdFactory))
	cmd.AddCommand(issues.NewCmdIssues(cmdFactory))
	cmd.AddCommand(report.NewCmdReport(cmdFactory))

	return cmd
}

func Execute() error {

	var err error

	var cmdFactory cmdutils.CLIFactory

	// Config operations
	var authConfigData cliConfig.ConfigData

	// Read the config file
	// If there is a config file already, this returns its data
	// Else the fields are blank
	authConfigData, _ = cliConfig.ReadConfig()

	cmdFactory.Config = authConfigData

	// Setting defaults factory settings
	cmdFactory.HostName = "https://api.deepsource.io/graphql/"
	cmdFactory.TokenExpired = true

	// Creating a GraphQL client which can be picked up by any command since its in the factory
	cmdFactory.GQLClient = api.NewDSClient(cmdFactory.HostName, cmdFactory.Config.Token)

	if cmdFactory.Config.Token != "" {
		cmdFactory.TokenExpired, err = api.CheckTokenExpiry(cmdFactory.GQLClient, cmdFactory.Config.Token)
		if err != nil {
			if err == fmt.Errorf("graphql: Signature has expired") {
				fmt.Println("The token has expired. Please refresh the token or reauthenticate.")
			}
		}
	}

	// Pass configData struct to all the packages
	cmd := NewCmdRoot(&cmdFactory)
	if err := cmd.Execute(); err != nil {
		return err
	}
	return nil
}
