package refresh

import (
	"github.com/deepsourcelabs/cli/cmdutils"
	"github.com/deepsourcelabs/cli/internal/config"
	"github.com/spf13/cobra"
)

type RefreshOptions struct {
}

// NewCmdVersion returns the current version of cli being used
func NewCmdRefresh(cf *cmdutils.CLIFactory) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "refresh",
		Short: "Refresh stored authentication credentials",
		RunE: func(cmd *cobra.Command, args []string) error {
			opts := RefreshOptions{}
			err := opts.Run()
			if err != nil {
				return err
			}
			return nil
		},
	}
	return cmd
}

func (opts *RefreshOptions) Run() error {

	err := config.DeleteConfigFile()
	if err != nil {
		return err
	}

	return nil
}
