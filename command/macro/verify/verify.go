package verify

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"

	mvalidator "github.com/deepsourcelabs/cli/analyzers/validator"
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
				return errors.New("Analyzer verification failed. Exiting...")
			}
			return nil
		},
	}
	return cmd
}

// Runs the command
func (opts *MacroVerifyOpts) Run() (err error) {
	var validationErrors []mvalidator.ValidationError
	spin := utils.SpinnerUtils{}

	// Check for path of `analyzer.toml` file and `issues` directory containing issue descriptions
	spin.StartSpinnerWithLabel("Checking for presence of analyzer.toml and issue descriptions...", "Yay!!Found analyzer.toml and issue descriptions.")
	if err = mvalidator.CheckForAnalyzerConfig(analyzerTOMLPath, issuesDirPath); err != nil {
		spin.StopSpinnerWithError("Failed to locate analyzer configurations", err)
		return
	}
	spin.StopSpinner()

	// Read and verify analyzer toml
	spin.StartSpinnerWithLabel("Validating analyzer.toml...", "Verified analyzer.toml")
	if _, err := mvalidator.ValidateAnalyzerTOML(analyzerTOMLPath); err != nil {
		spin.StopSpinnerWithError("Failed to verify analyzer.toml (./deepsource/analyzer/analyzer.toml)", err)
	}
	spin.StopSpinner()

	// Read and verify all issues
	spin.StartSpinnerWithLabel("Validating issue descriptions...", "Verified issue descriptions")
	if validationErrors, err = mvalidator.ValidateIssueDescriptions(issuesDirPath); err != nil {
		spin.StopSpinnerWithError("Failed to validate the following issue desriptions", err)
	}

	if len(validationErrors) > 0 {
		spin.StopSpinnerWithError("Failed to validate the following issue descriptions", err)
		for _, validationError := range validationErrors {
			file := validationError.File
			fmt.Printf("  * %s\n", file)
			for _, err := range validationError.Errors {
				msg := fmt.Sprintf("%s : %s", err.Message, err.Field)
				failureMsg := utils.GetFailureMessage(msg, "")
				fmt.Printf("    * %s", failureMsg)
			}
		}
	}
	spin.StopSpinner()

	// // TODO: Inject the name from analyzer.toml here (needs some refactoring)
	// macroBuilder := mbuilder.DockerBuildParams{
	//     ImageName: "dummy",
	// }

	// if err = macroBuilder.BuildMacroDockerImage(); err != nil {
	//     return err
	// }

	// Start build process
	return nil
}
