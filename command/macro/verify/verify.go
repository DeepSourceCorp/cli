package macro

import (
	"fmt"
	"os"
	"path/filepath"

	mbuilder "github.com/deepsourcelabs/cli/macros/build"
	mvalidator "github.com/deepsourcelabs/cli/macros/validator"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/spf13/cobra"
)

var (
	configFolder     string
	analyzerTOMLPath string
	issuesDirPath    string
)

// Options holds the metadata.
type MacroVerifyOpts struct{}

// NewCmdMacroVerify implements the verification workflow for Macros.
// Involves running type-checks and sanity checks on `analyzer.toml` and issue descriptions.
// Builds docker image of the macro taking into account the `build.steps` configured by the author.
func NewCmdMacroVerify() *cobra.Command {
	// Configuring the default values for analyzer.toml and issues directory
	cwd, _ := os.Getwd()
	configFolder = filepath.Join(cwd, ".deepsource/analyzer")
	analyzerTOMLPath = filepath.Join(configFolder, "analyzer.toml")
	issuesDirPath = filepath.Join(configFolder, "issues/")

	opts := MacroVerifyOpts{}
	cmd := &cobra.Command{
		Use:   "verify",
		Short: "Verify DeepSource Analyzers configuration",
		Args:  utils.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := opts.Run(); err != nil {
				return fmt.Errorf("Analyzer verification failed.Error: %s", err)
			}
			return nil
		},
	}
	return cmd
}

// Run the command
func (opts *MacroVerifyOpts) Run() (err error) {
	// Check for path of `analyzer.toml` file and `issues` directory containing issue descriptions
	if err = mvalidator.CheckForAnalyzerConfig(analyzerTOMLPath, issuesDirPath); err != nil {
		return err
	}

	// Read and verify analyzer toml
	if _, err := mvalidator.ValidateAnalyzerTOML(analyzerTOMLPath); err != nil {
		return err
	}

	// Read and verify all issues
	if err = mvalidator.ValidateIssueDescriptions(issuesDirPath); err != nil {
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
