package macro

import (
	macro "github.com/deepsourcelabs/cli/command/macro/verify"
	"github.com/spf13/cobra"
)

// Options holds the metadata.
type Options struct{}

// NewCmdVersion returns the current version of cli being used
func NewCmdMacro() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "macro",
		Short: "Operations related to DeepSource Macros",
	}
	cmd.AddCommand(macro.NewCmdMacroVerify())
	return cmd
}
