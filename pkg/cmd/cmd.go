package cmd

import (
	versionCmd "github.com/deepsourcelabs/cli/pkg/cmd/version"
	"github.com/spf13/cobra"
)

func NewCmdRoot(buildVersion, buildDate string) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "deepsource <command> <subcommand> [flags]",
		Short: "DeepSource CLI",
		Long:  `Now, ship good code directly from command line.`,
	}
	cmd.AddCommand(versionCmd.NewCmdVersion(buildVersion, buildDate))

	return cmd
}

func Execute(buildVersion string, buildDate string) error {
	cmd := NewCmdRoot(buildVersion, buildDate)
	err := cmd.Execute()
	if err != nil {
		return err
	}
	return nil
}
