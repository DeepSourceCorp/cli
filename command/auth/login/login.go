package login

import (
	"fmt"

	"github.com/deepsourcelabs/cli/cmdutils"
	"github.com/deepsourcelabs/cli/global"
	cliConfig "github.com/deepsourcelabs/cli/internal/config"
	"github.com/spf13/cobra"
)

// Options holds the metadata.
type LoginOptions struct {
	AuthTimedOut bool
	TokenExpired bool
	User         string
	Config       cliConfig.ConfigData
}

// NewCmdVersion returns the current version of cli being used
func NewCmdLogin() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "login",
		Short: "Login to DeepSource using Command Line Interface",
		RunE: func(cmd *cobra.Command, args []string) error {

			opts := LoginOptions{
				AuthTimedOut: false,
				TokenExpired: global.TokenExpired,
				User:         global.User,
			}
			err := opts.Run()
			if err != nil {
				return err
			}
			return nil
		},
		SilenceUsage: true,
	}
	return cmd
}

// Validate impletments the Validate method for the ICommand interface.
func (opts *LoginOptions) Validate() error {
	return nil
}

// Run executest the command.
func (opts *LoginOptions) Run() error {

	// Before starting the login workflow, check here for two conditions:
	// 1 - If the token has expired, display a message about it and re-authenticate user
	// 2 - If the token has not expired,does the user want to re-authenticate?

	// Checking for condition 1
	if opts.TokenExpired == false {

		// The user is already logged in, confirm re-authentication
		msg := fmt.Sprintf("You're already logged into deepsource.io as %s. Do you want to re-authenticate?", opts.User)
		helpText := ""

		response, err := cmdutils.ConfirmFromUser(msg, helpText)
		if err != nil {
			fmt.Println("Error in getting response. Please try again...")
			return err
		}

		// User doesn't want to re-authenticate
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
