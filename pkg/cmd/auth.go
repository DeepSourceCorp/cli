package cmd

import (
	"github.com/spf13/cobra"
)

// authCmd represents the auth command
func newAuthCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "auth",
		Short: "Authenticate to DeepSource CLI",
		Long:  `TODO`,
	}

	cmd.AddCommand(newLoginCmd())
	cmd.AddCommand(newLogoutCmd())
	return cmd
}
