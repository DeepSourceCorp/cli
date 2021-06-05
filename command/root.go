package command

import (
	"github.com/deepsourcelabs/cli/cmdutils"
	"github.com/deepsourcelabs/cli/command/auth"
	"github.com/deepsourcelabs/cli/command/version"
	"github.com/deepsourcelabs/cli/internal/config"
	"github.com/spf13/cobra"
)

type CLIFactory struct {
	Config       ConfigMeta
	TokenExpired bool
}

type ConfigMeta struct {
	Token               string
	RefreshToken        string
	RefreshTokenExpiry  int64
	RefreshTokenSetTime int64
}

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

	// 1. Read the config file
	authConfigData, _ = config.ReadConfig()

	// 2. Store the data received in the configData struct
	cmdFactory.Config = cmdutils.ConfigMeta{
		Token:               authConfigData.Token,
		RefreshToken:        authConfigData.RefreshToken,
		RefreshTokenExpiry:  authConfigData.RefreshTokenExpiry,
		RefreshTokenSetTime: authConfigData.RefreshTokenSetTime,
	}

	// TODO: Validate if the JWT has expired or not
	// config.ValidateJWTExpiry(cmdFactory.Config.Token)

	// 4. Pass configData struct to all the packages
	cmd := NewCmdRoot(&cmdFactory)
	if err := cmd.Execute(); err != nil {
		return err
	}
	return nil
}
