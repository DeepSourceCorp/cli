package repository

import (
	"github.com/spf13/cobra"

	"github.com/deepsourcelabs/cli/command/repository/dashboard"
	"github.com/deepsourcelabs/cli/command/repository/status"
)

func NewCmdRepository() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "repo",
		Aliases: []string{"repository"},
		Short:   "Manage repository settings",
	}
	cmd.AddCommand(dashboard.NewCmdDashboard())
	cmd.AddCommand(status.NewCmdRepoStatus())
	return cmd
}
