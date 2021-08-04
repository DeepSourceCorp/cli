package logout

import (
	"github.com/deepsourcelabs/cli/cmdutils"
	cliConfig "github.com/deepsourcelabs/cli/config"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

type LogoutOptions struct{}

// NewCmdVersion returns the current version of cli being used
func NewCmdLogout() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "logout",
		Short: "Logout of your active DeepSource account",
		Args:  cmdutils.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			opts := LogoutOptions{}
			err := opts.Run()
			if err != nil {
				return err
			}
			return nil
		},
	}
	return cmd
}

func (opts *LogoutOptions) Run() error {

	logoutConfirmationMsg := "Are you sure you want to log out of DeepSource account?"
	helpText := ""
	response, err := cmdutils.ConfirmFromUser(logoutConfirmationMsg, helpText)
	if err != nil {
		return err
	}

	if response == true {
		cfg := cliConfig.CLIConfig{}
		err := cfg.Delete()
		if err != nil {
			return err
		}
	}

	pterm.Info.Println("Logged out from DeepSource (deepsource.io)")
	return nil
}
