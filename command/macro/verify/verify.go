package macro

import (
	mbuilder "github.com/deepsourcelabs/cli/macros/build"
	mvalidator "github.com/deepsourcelabs/cli/macros/validator"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/spf13/cobra"
)

// Options holds the metadata.
type MacroVerifyOpts struct{}

// Verifies analyzer.toml
// Verifies issue descriptions
// Show errors in diagnostic format
// Generates Dockerfile
// Builds docker image

// NewCmdMacroVerify implements the verification workflow for Macros.
// Involves running type-checks and sanity checks on `analyzer.toml` and issue descriptions.
// Builds docker image of the macro taking into account the `build.steps` configured by the author.
func NewCmdMacroVerify() *cobra.Command {
	opts := MacroVerifyOpts{}
	cmd := &cobra.Command{
		Use:   "verify",
		Short: "Verify DeepSource Macros configuration",
		Args:  utils.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			return opts.Run()
		},
	}
	return cmd
}

func (opts *MacroVerifyOpts) Run() (err error) {
	// Check for path of `analyzer.toml` file and `issues` directory containing issue descriptions
	if err = mvalidator.CheckConfigPresent(); err != nil {
		return err
	}

	// Read and verify analyzer toml
	if err = mvalidator.ValidateAnalyzerTOML(); err != nil {
		return err
	}

	// Read and verify all issues
	if err = mvalidator.ValidateIssueDescriptions(); err != nil {
		return err
	}

	// TODO: Inject the name from analyzer.toml here (needs some refactoring)
	macroBuilder := mbuilder.DockerBuildParams{
		ImageName: "dummy",
	}

	if err = macroBuilder.BuildMacroDockerImage(); err != nil {
		return err
	}

	// Start build process
	return nil
}
