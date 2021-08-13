package login

import (
	"fmt"

	config "github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/spf13/cobra"
)

// Options holds the metadata.
type LoginOptions struct {
	AuthTimedOut bool
	TokenExpired bool
	User         string
}

// NewCmdVersion returns the current version of cli being used
func NewCmdLogin() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "login",
		Short: "Login to DeepSource using Command Line Interface",
		Args:  utils.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {

			opts := LoginOptions{
				AuthTimedOut: false,
				TokenExpired: config.Cfg.IsExpired(),
				User:         config.Cfg.User,
			}
			err := opts.Run()
			if err != nil {
				return err
			}
			return err
		},
	}
	return cmd
}

// Run executes the auth command
func (opts *LoginOptions) Run() error {
	// Before starting the login workflow, check here for two conditions:
	// Condition 1 : If the token has expired, display a message about it and re-authenticate user
	// Condition 2 : If the token has not expired,does the user want to re-authenticate?

	// Checking for condition 1
	if opts.TokenExpired == false {
		// The user is already logged in, confirm re-authentication
		msg := fmt.Sprintf("You're already logged into deepsource.io as %s. Do you want to re-authenticate?", opts.User)
		response, err := utils.ConfirmFromUser(msg, "")
		if err != nil {
			return fmt.Errorf("Error in fetching response. Please try again.")
		}

		// If the response is No, it implies that the user doesn't want to re-authenticate
		// In this case, just exit
		if response == false {
			return nil
		}
	}

	// Condition 2
	// `startLoginFlow` implements the Login flow
	err := opts.startLoginFlow()
	if err != nil {
		return err
	}

	return nil
}
