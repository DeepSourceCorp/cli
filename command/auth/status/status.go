package status

import (
	"errors"
	"fmt"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

type AuthStatusOptions struct{}

// NewCmdStatus handles the fetching of authentication status of CLI
func NewCmdStatus() *cobra.Command {

	cmd := &cobra.Command{
		Use:   "status",
		Short: "View the authentication status",
		Args:  utils.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			opts := AuthStatusOptions{}
			return opts.Run()
		},
	}
	return cmd
}

func (opts *AuthStatusOptions) Run() error {
	// Fetch config
	cfg, err := config.GetConfig()
	if err != nil {
		return fmt.Errorf("Error while reading DeepSource CLI config : %v", err)
	}
	// Checking if the user has authenticated / logged in or not
	if cfg.Token == "" {
		return errors.New("You are not logged into DeepSource. Run \"deepsource auth login\" to authenticate.")
	}

	// Check if the token has already expired
	if !cfg.IsExpired() {
		pterm.Info.Printf("Logged in to DeepSource as %s.\n", cfg.User)
	} else {
		pterm.Info.Println("The authentication has expired. Run \"deepsource auth refresh\" to refresh the credentials.")
	}
	return nil
}
