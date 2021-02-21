package cmd

import (
	authLoginCmd "github.com/deepsourcelabs/lilith/cmd/login"
	authLogoutCmd "github.com/deepsourcelabs/lilith/cmd/logout"
	authRefreshCmd "github.com/deepsourcelabs/lilith/cmd/refresh_token"

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
	cmd.AddCommand(authLogoutCmd.logoutCmd())
	cmd.AddCommand(authRefreshCmd.refreshTokenCmd())
	return cmd
}
