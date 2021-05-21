package version

import (
	"fmt"

	"github.com/spf13/cobra"
)

// NewCmdVersion returns the current version of cli being used
func NewCmdVersion(version, date string) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "version",
		Short: "Get the version of the DeepSource CLI",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Println(formatVersionOutput(version, date))
		},
	}
	return cmd
}

func formatVersionOutput(version, date string) string {

	// Changelog URL
	releasePath := fmt.Sprintf("https://github.com/deepsourcelabs/cli/releases/tag/%s", version)

	return fmt.Sprintf("DeepSource CLI %s\nReleased on %s\n%s", version, date, releasePath)

}
