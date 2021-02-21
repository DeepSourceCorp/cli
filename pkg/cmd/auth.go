package cmd

import (
	authLoginCmd "cli/cmd/login"

	"github.com/spf13/cobra"
)

// authCmd represents the auth command
func cmdAuth() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "auth",
		Short: "Authenticate to DeepSource CLI",
		Long:  `TODO`,
	}

	cmd.AddCommand(authLoginCmd.loginCmd())
	return cmd
}
