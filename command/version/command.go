package version

import (
	"fmt"

	versionsvc "github.com/deepsourcelabs/cli/internal/services/version"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/deepsourcelabs/cli/version"
	"github.com/spf13/cobra"
)

// Options holds the metadata.
type Options struct{}

// For testing.  TODO: cleanup
var getBuildInfo = version.GetBuildInfo

// NewCmdVersion returns the current version of cli being used
func NewCmdVersion() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "version",
		Short: "Get the version of the DeepSource CLI",
		Args:  utils.NoArgs,
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
