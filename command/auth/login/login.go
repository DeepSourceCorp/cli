package login

import (
	"fmt"

	"github.com/deepsourcelabs/cli/api"
	"github.com/deepsourcelabs/cli/cmdutils"
	"github.com/deepsourcelabs/cli/internal/config"
	"github.com/spf13/cobra"
)

// Options holds the metadata.
type LoginOptions struct {
	graphqlClient *api.DSClient
	hostName      string
	AuthTimedOut  bool
	TokenExpired  bool
	Config        config.ConfigData
}

// NewCmdVersion returns the current version of cli being used
func NewCmdLogin(cf *cmdutils.CLIFactory) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "login",
		Short: "Login to DeepSource using Command Line Interface",
		RunE: func(cmd *cobra.Command, args []string) error {
			opts := LoginOptions{
				graphqlClient: cf.GQLClient,
				hostName:      cf.HostName,
				AuthTimedOut:  false,
				TokenExpired:  cf.TokenExpired,
				Config:        cf.Config,
			}
			err := opts.Run()
			if err != nil {
				return err
			}
			return nil
		},
	}
	return cmd
}

// Validate impletments the Validate method for the ICommand interface.
func (opts *LoginOptions) Validate() error {
	return nil
}

// Run executest the command.
func (opts *LoginOptions) Run() error {

	// Check here if user is already authenticated before beginning login workflow

	if opts.TokenExpired == true {

		// Use survey to display confirmation message if user wants to reauthenticate
		msg := fmt.Sprintf("You're already logged into deepsource.io as %s. Do you want to re-authenticate?", opts.Config.User)
		helpText := ""
		response, err := cmdutils.ConfirmFromUser(msg, helpText)
		if err != nil {
			return err
		}

		if response == false {
			return nil
		}
	}

	// Login flow starts
	err := opts.startLoginFlow()
	if err != nil {
		return err
	}

	return nil
}
