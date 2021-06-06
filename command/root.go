package command

import (
	"log"

	"github.com/deepsourcelabs/cli/api"
	"github.com/deepsourcelabs/cli/cmdutils"
	"github.com/deepsourcelabs/cli/command/auth"
	"github.com/deepsourcelabs/cli/command/version"
	"github.com/deepsourcelabs/cli/internal/config"
	"github.com/spf13/cobra"
)

func NewCmdRoot(cmdFactory *cmdutils.CLIFactory) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "deepsource <command> <subcommand> [flags]",
		Short: "DeepSource CLI",
		Long:  `Now ship good code directly from the command line.`,
	}
	cmd.AddCommand(version.NewCmdVersion())
	cmd.AddCommand(auth.NewCmdAuth(cmdFactory))

	return cmd
}

func Execute() error {

	var cmdFactory cmdutils.CLIFactory

	// Config operations
	var authConfigData config.ConfigData

	// Read the config file
	authConfigData, _ = config.ReadConfig()

	// Store the data received in the configData struct
	cmdFactory.Config = cmdutils.ConfigMeta{
		Token:               authConfigData.Token,
		RefreshToken:        authConfigData.RefreshToken,
		RefreshTokenExpiry:  authConfigData.RefreshTokenExpiry,
		RefreshTokenSetTime: authConfigData.RefreshTokenSetTime,
	}

	// Creating a GraphQL client
	gq := api.GetClient("http://localhost:8000/graphql/", cmdFactory.Config.Token, cmdFactory.Config.RefreshToken)
	tokenStatus, err := api.VerifyJWT(gq, cmdFactory.Config.Token)
	if err != nil {
		log.Println(err)
	}
	log.Println(tokenStatus)

	// Pass configData struct to all the packages
	cmd := NewCmdRoot(&cmdFactory)
	if err := cmd.Execute(); err != nil {
		return err
	}
	return nil
}
