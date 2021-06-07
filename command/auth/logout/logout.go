package logout

import (
	"github.com/deepsourcelabs/cli/cmdutils"
	"github.com/deepsourcelabs/cli/internal/config"
	"github.com/spf13/cobra"
)

type LogoutOptions struct {
}

// NewCmdVersion returns the current version of cli being used
func NewCmdLogout(cf *cmdutils.CLIFactory) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "logout",
		Short: "Logout from the DeepSource authentication on Command Line",
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

	err := config.DeleteConfigFile()
	if err != nil {
		return err
	}

	return nil
}
