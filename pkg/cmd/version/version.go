package version

import (
	"fmt"

	"github.com/spf13/cobra"
)

// NewCmdVersion returns the current version of cli being used
func NewCmdVersion(version string, date string) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "version",
		Short: "Get the version of the DeepSource CLI",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Println(formatVersionOutput(version, date))
		},
	}
	return cmd
}

func formatVersionOutput(version string, date string) string {

	return fmt.Sprintf("%s %s", version, date)

}
