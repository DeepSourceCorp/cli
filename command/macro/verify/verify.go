package verify

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	bd "github.com/deepsourcelabs/cli/analyzers/build"
	vl "github.com/deepsourcelabs/cli/analyzers/validator"
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
	var validationErrors []vl.ValidationError
	spin := utils.SpinnerUtils{}

	// Check for path of `analyzer.toml` file and `issues` directory containing issue descriptions
	spin.StartSpinnerWithLabel("Checking for presence of analyzer.toml and issue descriptions...", "Yay!!Found analyzer.toml and issue descriptions.")
	if err = vl.CheckForAnalyzerConfig(analyzerTOMLPath, issuesDirPath); err != nil {
		spin.StopSpinnerWithError("Failed to locate analyzer configurations", err)
		return
	}
	spin.StopSpinner()

	// Read and verify analyzer toml
	spin.StartSpinnerWithLabel("Validating analyzer.toml...", "Verified analyzer.toml")
	analyzerTOMLData, err := vl.ValidateAnalyzerTOML(analyzerTOMLPath)
	if err != nil {
		spin.StopSpinnerWithError("Failed to verify analyzer.toml", err)
	}
	spin.StopSpinner()

	// Read and verify all issues
	spin.StartSpinnerWithLabel("Validating issue descriptions...", "Verified issue descriptions")
	if validationErrors, err = vl.ValidateIssueDescriptions(issuesDirPath); err != nil {
		spin.StopSpinnerWithError("Failed to validate the following issue desriptions", err)
	}

	// Check if there are any validation errors in issue descriptions
	if len(validationErrors) > 0 {
		spin.StopSpinnerWithError("Failed to validate the following issue descriptions\n", err)
		for _, validationError := range validationErrors {
			file := validationError.File
			fmt.Printf("  * %s\n", file)
			for _, err := range validationError.Errors {
				msg := fmt.Sprintf("%s : %s", err.Message, err.Field)
				failureMsg := utils.GetFailureMessage(msg, "")
				fmt.Printf("    * %s\n", failureMsg)
			}
		}
	}
	spin.StopSpinner()

	// Build verification

	// Specifying the name of the image to be built
	var dockerFileName string
	if analyzerTOMLData.Shortcode != "" {
		dockerFileName = strings.TrimPrefix(analyzerTOMLData.Shortcode, "@")
	}

	// Specifying the source to build
	// Check for the presence of `build.Dockerfile` or if not a `Dockerfile` in the current working directory
	if _, err := os.Stat(analyzerTOMLData.Build.Dockerfile); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			spin.StopSpinnerWithError("Failed to build the image", fmt.Errorf("%s not found. Checking for existence of Dockerfile.", analyzerTOMLData.Build.Dockerfile))
		}
	}

	// Checking for the existence of "Dockerfile" since `build.Dockerfile` couldn't be found
	if _, err := os.Stat("Dockerfile"); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			spin.StopSpinnerWithError("Failed to build the image", fmt.Errorf("Dockerfile not found"))
		}
	}

	analyzerBuilder := bd.DockerClient{
		ImageName: dockerFileName,
	}

	spin.StartSpinnerWithLabel(fmt.Sprintf("Building Analyzer image with the name \"%s\"", dockerFileName), "Successfully built the Analyzer image")
	buildErr := analyzerBuilder.BuildAnalyzerDockerImage()
	if buildErr != nil {
		spin.StopSpinnerWithError("Failed to build the image", fmt.Errorf(buildErr.Error()))
	}
	spin.StopSpinner()

	return nil
}
