package cmd

import (
	"github.com/deepsourcelabs/cli/pkg/logout"
	"github.com/spf13/cobra"
)

// loginCmd represents the login command
func newLogoutCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "login",
		Short: "Authenticate to DeepSource using OAuth.",
		Run:   logout.Logout,
	}
	return cmd
}
