package version

import (
	"github.com/spf13/cobra"
)

// NewCmdVersion returns the current version of cli being used
func NewCmdVersion() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "version",
		Short: "Get the version of the DeepSource CLI",
		Run:   RunVersion,
	}

	return cmd
}

func RunVersion(cmd *cobra.Command, args []string) {
	cmd.Println("DeepSource CLI v0.2")
}
