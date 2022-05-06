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

type MacroVerifyOpts struct{}

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
		RunE: func(_ *cobra.Command, _ []string) error {
			if err := opts.Run(); err != nil {
				return fmt.Errorf("Analyzer verification failed.Error: %s", err)
			}
			return nil
		},
	}
	return cmd
}

// Runs the command
func (opts *MacroVerifyOpts) Run() (err error) {
	spin := utils.SpinnerUtils{}
	spin.StartSpinnerWithLabel("Validating analyzer.toml...")
	// Check for path of `analyzer.toml` file and `issues` directory containing issue descriptions
	if err = mvalidator.CheckForAnalyzerConfig(analyzerTOMLPath, issuesDirPath); err != nil {
		spin.StopSpinner()
		return err
	}
	spin.StopSpinner()

	spin = utils.SpinnerUtils{}
	spin.StartSpinnerWithLabel("Validating analyzer.toml...")
	// Read and verify analyzer toml
	if _, err := mvalidator.ValidateAnalyzerTOML(analyzerTOMLPath); err != nil {
		spin.StopSpinner()
		return err
	}
	spin.StopSpinner()

	spin = utils.SpinnerUtils{}
	spin.StartSpinnerWithLabel("Validating analyzer.toml...")
	// Read and verify all issues
	if err = mvalidator.ValidateIssueDescriptions(issuesDirPath); err != nil {
		spin.StopSpinner()
		return err
	}
	spin.StopSpinner()

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
