package login

import (
	"fmt"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/spf13/cobra"
)

// LoginOptions hold the metadata related to login operation
type LoginOptions struct {
	AuthTimedOut bool
	TokenExpired bool
	User         string
	HostName     string
}

// NewCmdLogin handles the login functionality for the CLI
func NewCmdLogin() *cobra.Command {

	opts := LoginOptions{
		AuthTimedOut: false,
		TokenExpired: true,
		User:         "",
		HostName:     "",
	}

	cmd := &cobra.Command{
		Use:   "login",
		Short: "Login to DeepSource using Command Line Interface",
		Args:  utils.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			return opts.Run()
		},
	}

	// --host, -h flag
	cmd.Flags().StringVar(&opts.HostName, "hostname", "", "Authenticate with a specific DeepSource Enterprise Server instance")
	return cmd
}

// Run executes the auth command and starts the login flow if not already authenticated
func (opts *LoginOptions) Run() error {
	// Fetch config
	cfg, _ := config.GetConfig()
	opts.User = cfg.User
	opts.TokenExpired = cfg.IsExpired()

	// Checking if the user passed a hostname. If yes, storing it in the config
	// Else using the default hostname (deepsource.io)
	if opts.HostName != "" {
		cfg.Host = opts.HostName
	} else {
		cfg.Host = config.DefaultHostName
	}

	// Before starting the login workflow, check here for two conditions:
	// Condition 1 : If the token has expired, display a message about it and re-authenticate user
	// Condition 2 : If the token has not expired,does the user want to re-authenticate?

	// Checking for condition 1
	if !opts.TokenExpired {
		// The user is already logged in, confirm re-authentication.
		msg := fmt.Sprintf("You're already logged into DeepSource as %s. Do you want to re-authenticate?", opts.User)
		response, err := utils.ConfirmFromUser(msg, "")
		if err != nil {
			return fmt.Errorf("Error in fetching response. Please try again.")
		}
		// If the response is No, it implies that the user doesn't want to re-authenticate
		// In this case, just exit
		if !response {
			return nil
		}
	}

	// Condition 2
	// `startLoginFlow` implements the authentication flow for the CLI
	return opts.startLoginFlow(cfg)
}
