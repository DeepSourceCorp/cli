package logout

import (
	"errors"
	"fmt"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

type LogoutOptions struct{}

// NewCmdLogout handles the logout functionality for the CLI
func NewCmdLogout() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "logout",
		Short: "Logout of your active DeepSource account",
		Args:  utils.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			opts := LogoutOptions{}
			return opts.Run()
		},
	}
	return cmd
}

func (*LogoutOptions) Run() error {
	// Fetch config
	cfg, err := config.GetConfig()
	if err != nil {
		return fmt.Errorf("Error while reading DeepSource CLI config : %v", err)
	}
	// Checking if the user has authenticated / logged in or not
	if cfg.Token == "" {
		return errors.New("You are not logged into DeepSource. Run \"deepsource auth login\" to authenticate.")
	}

	// Confirm from the user if they want to logout
	logoutConfirmationMsg := "Are you sure you want to log out of DeepSource account?"
	response, err := utils.ConfirmFromUser(logoutConfirmationMsg, "")
	if err != nil {
		return err
	}

	// If response is true, delete the config file => logged out the user
	if response {
		err := cfg.Delete()
		if err != nil {
			return err
		}
	}
	pterm.Info.Println("Logged out from DeepSource (deepsource.io)")
	return nil
}
