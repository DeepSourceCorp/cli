package cmd

import (
	"github.com/deepsourcelabs/cli/pkg/login"
	"github.com/spf13/cobra"
)

// loginCmd represents the login command
func newLoginCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "login",
		Short: "Authenticate to DeepSource using OAuth.",
		Run:   login.Login,
	}
	return cmd
}
