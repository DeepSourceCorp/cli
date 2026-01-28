package version

import (
	"fmt"

	"github.com/deepsourcelabs/cli/internal/cli/args"
	versionsvc "github.com/deepsourcelabs/cli/internal/services/version"
	"github.com/deepsourcelabs/cli/buildinfo"
	"github.com/spf13/cobra"
)

// Options holds the metadata.
type Options struct{}

// For testing.  TODO: cleanup
var getBuildInfo = buildinfo.GetBuildInfo

// NewCmdVersion returns the current version of cli being used
func NewCmdVersion() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "version",
		Short: "Get the version of the DeepSource CLI",
		Args:  args.NoArgs,
		Run: func(cmd *cobra.Command, args []string) {
			o := Options{}
			fmt.Println(o.Run())
		},
		SilenceErrors: true,
		SilenceUsage:  true,
	}
	return cmd
}

// Validate impletments the Validate method for the ICommand interface.
func (Options) Validate() error {
	return nil
}

// Run executest the command.
func (Options) Run() string {
	svc := versionsvc.NewServiceWith(getBuildInfo)
	return svc.String()
}
