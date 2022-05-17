package verify

import (
	"errors"
	"fmt"
	"path/filepath"

	"github.com/deepsourcelabs/cli/analyzers/validator"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/spf13/cobra"
)

var (
	analyzerTOMLPath string
	issuesDirPath    string
	configFolder     string = ".deepsource/analyzer"
)

type AnalyzerVerifyOpts struct {
	VerboseMode bool
}

func NewCmdAnalyzerVerify() *cobra.Command {
	// Configuring the paths of analyzer.toml and issues directory
	projectRoot, err := utils.ExtractProjectRootPath()
	if err != nil {
		fmt.Printf("Couldn't find the root directory of the project. Error:%s", err)
	}

	analyzerTOMLPath = filepath.Join(projectRoot, configFolder, "analyzer.toml")
	issuesDirPath = filepath.Join(projectRoot, configFolder, "issues/")

	opts := AnalyzerVerifyOpts{
		VerboseMode: false,
	}
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

	// --verbose flag. On being set, the build logs as well as the verification diagnostics are visible to the user
	cmd.Flags().BoolVar(&opts.VerboseMode, "verbose", false, "Output build logs and diagnostics related to verification failures")
	return cmd
}

// Runs the command
func (a *AnalyzerVerifyOpts) Run() (err error) {
	var validationErrors *[]validator.ValidationError
	spin := utils.SpinnerUtils{}
	configurationValid := true

	/////////////////////////////////
	// Configuration verification///
	///////////////////////////////

	// Check for path of `analyzer.toml` file and `issues` directory containing issue descriptions
	spin.StartSpinnerWithLabel("Checking for presence of analyzer.toml and issue descriptions...", "Yay!!Found analyzer.toml and issue descriptions.")
	if err = validator.CheckForAnalyzerConfig(analyzerTOMLPath, issuesDirPath); err != nil {
		configurationValid = false
		spin.StopSpinnerWithError("Failed to locate analyzer configurations", err)
		return
	}
	spin.StopSpinner()

	// Read and verify analyzer toml
	spin.StartSpinnerWithLabel("Validating analyzer.toml...", "Verified analyzer.toml")
	_, analyzerTOMLValidationErrors, err := validator.ValidateAnalyzerTOML(analyzerTOMLPath)
	if analyzerTOMLValidationErrors != nil {
		configurationValid = false
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
		configurationValid = false
		spin.StopSpinnerWithError("Failed to validate the following issue desriptions", err)
	}

	// Check if there are any validation errors in issue descriptions
	if validationErrors != nil {
		configurationValid = false
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

	// Do not move to building the image if the configuration verification fails
	if !configurationValid {
		return
	}

	/////////////////////////
	// Build verification //
	///////////////////////

	// Specifying the name of the image to be built
	// Set the default Dockerfile path as "Dockerfile"
	// dockerFilePath, dockerFileName := build.GetDockerImageDetails(analyzerTOMLData)
	// var dockerFilePath, dockerFileName string
	// dockerFilePath = "Dockerfile"

	// // Read config for the value if specified
	// if analyzerTOMLData.Build.Dockerfile != "" {
	//     dockerFilePath = analyzerTOMLData.Build.Dockerfile
	// }
	// if analyzerTOMLData.Shortcode != "" {
	//     dockerFileName = strings.TrimPrefix(analyzerTOMLData.Shortcode, "@")
	// }

	// switch a.VerboseMode {
	// case true:
	//     arrowIcon := ansi.Color("> [verbose]", "yellow")
	//     fmt.Printf("%s Building Analyzer image with the name \"%s\"\n", arrowIcon, dockerFileName)
	// case false:
	//     spin.StartSpinnerWithLabel(fmt.Sprintf("Building Analyzer image with the name \"%s\"", dockerFileName), "Successfully built the Analyzer image")
	// }

	// // Specifying the source to build
	// // Check for the presence of `build.Dockerfile` or if not a `Dockerfile` in the current working directory
	// if _, err := os.Stat(dockerFilePath); err != nil {
	//     if errors.Is(err, os.ErrNotExist) {
	//         spin.StopSpinnerWithError("Failed to build the image", fmt.Errorf("%s not found\n", dockerFilePath))
	//         return err
	//     }
	// }

	// analyzerBuilder := build.DockerClient{
	//     ImageName:      dockerFileName,
	//     DockerfilePath: dockerFilePath,
	//     ImageTag:       generateImageVersion(7),
	//     Logs:           a.VerboseMode,
	// }
	// buildErr := analyzerBuilder.BuildAnalyzerDockerImage()
	// if buildErr != nil {
	//     spin.StopSpinnerWithError("Failed to build the image", fmt.Errorf(buildErr.Error()))
	// }

	// if !a.VerboseMode {
	//     spin.StopSpinner()
	// }

	return nil
}
