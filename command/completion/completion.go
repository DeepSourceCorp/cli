package completion

import (
	"os"

	"github.com/deepsourcelabs/cli/internal/cli/completion"
	"github.com/spf13/cobra"
)

func NewCmdCompletion() *cobra.Command {
	return &cobra.Command{
		Use:   "completion",
		Short: "Install shell completions for bash, zsh, or fish",
		RunE: func(cmd *cobra.Command, _ []string) error {
			return completion.Install(cmd.Root(), os.Stderr)
		},
	}
}
