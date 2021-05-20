package cmd

import (
	"fmt"
	"os"

	versionCmd "github.com/deepsourcelabs/cli/pkg/cmd/version"
	"github.com/spf13/cobra"
)

func NewCmdRoot() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "deepsource <command> <subcommand> [flags]",
		Short: "DeepSource CLI",
		Long:  `Now, ship good code directly from command line.`,
	}
	cmd.AddCommand(versionCmd.NewCmdVersion())

	return cmd
}

func Execute() {
	cmd := NewCmdRoot()
	if err := cmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
