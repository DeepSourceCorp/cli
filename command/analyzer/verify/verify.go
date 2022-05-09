package verify

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	dbuild "github.com/deepsourcelabs/cli/analyzers/build/docker"
	validator "github.com/deepsourcelabs/cli/analyzers/validator"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/spf13/cobra"
)

var (
	configFolder     string = ".deepsource/analyzer"
	analyzerTOMLPath string
	issuesDirPath    string
)

type MacroVerifyOpts struct{}

func NewCmdAnalyzerVerify() *cobra.Command {
	cwd, _ := os.Getwd()

	// Extracting the path of the project root
	projectRoot, err := utils.ExtractProjectRootPath()
	if err != nil {
		projectRoot = cwd
	}

	// Configuring the paths of analyzer.toml and issues directory
	analyzerTOMLPath = filepath.Join(projectRoot, configFolder, "analyzer.toml")
	issuesDirPath = filepath.Join(projectRoot, configFolder, "issues/")

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
	var validationErrors *[]validator.ValidationError
	spin := utils.SpinnerUtils{}

	// Check for path of `analyzer.toml` file and `issues` directory containing issue descriptions
	spin.StartSpinnerWithLabel("Checking for presence of analyzer.toml and issue descriptions...", "Yay!!Found analyzer.toml and issue descriptions.")
	if err = validator.CheckForAnalyzerConfig(analyzerTOMLPath, issuesDirPath); err != nil {
		spin.StopSpinnerWithError("Failed to locate analyzer configurations", err)
		return
	}
	spin.StopSpinner()

	// Read and verify analyzer toml
	spin.StartSpinnerWithLabel("Validating analyzer.toml...", "Verified analyzer.toml")
	analyzerTOMLData, analyzerTOMLValidationErrors, err := validator.ValidateAnalyzerTOML(analyzerTOMLPath)
	if analyzerTOMLValidationErrors != nil {
		spin.StopSpinnerWithError("Failed to verify analyzer.toml\n", err)
		for _, err := range analyzerTOMLValidationErrors.Errors {
			msg := fmt.Sprintf("%s : %s", err.Message, err.Field)
			failureMsg := utils.GetFailureMessage(msg, "")
			fmt.Printf("  * %s\n", failureMsg)
		}
	}
	spin.StopSpinner()

	// Read and verify all issues
	spin.StartSpinnerWithLabel("Validating issue descriptions...", "Verified issue descriptions")
	if validationErrors, err = validator.ValidateIssueDescriptions(issuesDirPath); err != nil {
		spin.StopSpinnerWithError("Failed to validate the following issue desriptions", err)
	}

	// Check if there are any validation errors in issue descriptions
	if len(*validationErrors) > 0 {
		spin.StopSpinnerWithError("Failed to validate the following issue descriptions\n", err)
		for _, validationError := range *validationErrors {
			fmt.Printf("  * %s\n", validationError.File)
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
	var dockerFilePath, dockerFileName string
	dockerFilePath = analyzerTOMLData.Build.Dockerfile
	if analyzerTOMLData.Shortcode != "" {
		dockerFileName = strings.TrimPrefix(analyzerTOMLData.Shortcode, "@")
	}

	spin.StartSpinnerWithLabel(fmt.Sprintf("Building Analyzer image with the name \"%s\"", dockerFileName), "Successfully built the Analyzer image")
	// Specifying the source to build
	// Check for the presence of `build.Dockerfile` or if not a `Dockerfile` in the current working directory
	if _, err := os.Stat(analyzerTOMLData.Build.Dockerfile); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			spin.StopSpinnerWithError("Failed to build the image", fmt.Errorf("%s not found\n", analyzerTOMLData.Build.Dockerfile))
			return err
		}
	}

	// Checking for the existence of "Dockerfile" since `build.Dockerfile` couldn't be found
	if _, err := os.Stat("Dockerfile"); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			spin.StopSpinnerWithError("Failed to build the image", fmt.Errorf("Dockerfile not found\n"))
			return err
		}
	}

	analyzerBuilder := dbuild.DockerClient{
		ImageName:      dockerFileName,
		DockerfilePath: dockerFilePath,
		ImageTag:       generateImageVersion(7),
	}

	buildErr := analyzerBuilder.BuildAnalyzerDockerImage()
	if buildErr != nil {
		spin.StopSpinnerWithError("Failed to build the image", fmt.Errorf(buildErr.Error()))
	}
	spin.StopSpinner()

	return nil
}
