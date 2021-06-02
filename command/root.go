package command

import (
<<<<<<< HEAD
=======
	"github.com/deepsourcelabs/cli/command/config"
>>>>>>> d2c301a (Init config generation)
	"github.com/deepsourcelabs/cli/command/version"
	"github.com/spf13/cobra"
)

func NewCmdRoot() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "deepsource <command> <subcommand> [flags]",
		Short: "DeepSource CLI",
		Long:  `Now ship good code directly from the command line.`,
	}
	cmd.AddCommand(version.NewCmdVersion())
<<<<<<< HEAD
=======
	cmd.AddCommand(config.NewCmdConfig())
>>>>>>> d2c301a (Init config generation)

	return cmd
}

func Execute() error {
	cmd := NewCmdRoot()
	if err := cmd.Execute(); err != nil {
		return err
	}
	return nil
}
