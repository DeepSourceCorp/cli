package cmd

import (
	"fmt"
	"os"

	versionCmd "github.com/deepsourcelabs/cli/pkg/cmd/version"
	"github.com/spf13/cobra"
)

func NewCmdRoot(buildVersion string, buildDate string) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "deepsource <command> <subcommand> [flags]",
		Short: "DeepSource CLI",
		Long:  `Now, ship good code directly from command line.`,
	}
	cmd.AddCommand(versionCmd.NewCmdVersion(buildVersion, buildDate))

	return cmd
}

func Execute(buildVersion string, buildDate string) {
	cmd := NewCmdRoot(buildVersion, buildDate)
	if err := cmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
