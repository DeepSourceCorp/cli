package verify

import (
	"errors"
	"fmt"
	"path/filepath"

	"github.com/deepsourcelabs/cli/analyzers/validator"
	"github.com/deepsourcelabs/cli/types"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

var (
	analyzerTOMLPath string
	issuesDirPath    string
	configFolder     string = ".deepsource/analyzer"
)

type AnalyzerBuild struct {
	DockerFilePath  string
	DockerImageName string
	VerboseMode     bool
}

type AnalyzerVerifyOpts struct {
	AnalyzerTOMLData *types.AnalyzerTOML
	Build            AnalyzerBuild
	Spinner          *utils.SpinnerUtils
}

/* ======================================
 * $ deepsource analyzer verify
 * ====================================== */

func NewCmdAnalyzerVerify() *cobra.Command {
	// Configuring the paths of analyzer.toml and issues directory
	projectRoot, err := utils.ExtractProjectRootPath()
	if err != nil {
		fmt.Printf("Couldn't find the root directory of the project. Error:%s", err)
	}
	analyzerTOMLPath = filepath.Join(projectRoot, configFolder, "analyzer.toml")
	issuesDirPath = filepath.Join(projectRoot, configFolder, "issues/")

	opts := AnalyzerVerifyOpts{
		Spinner: &utils.SpinnerUtils{},
		Build: AnalyzerBuild{
			VerboseMode: false,
		},
	}
	cmd := &cobra.Command{
		Use:   "verify",
		Short: "Verify DeepSource Analyzers configuration",
		Args:  utils.NoArgs,
		RunE: func(_ *cobra.Command, _ []string) error {
			if err := opts.verifyAnalyzer(); err != nil {
				return errors.New("Analyzer verification failed. Exiting.")
			}
			pterm.Success.Println("Analyzer verification successful!")
			return nil
		},
	}

	// --verbose flag. On being set, the build logs as well as the verification diagnostics are visible to the user
	cmd.Flags().BoolVar(&opts.Build.VerboseMode, "verbose", false, "Output build logs and diagnostics related to verification failures")
	return cmd
}

/* ====================================
 * Analyzer configuration verification
 * ==================================== */

func (a *AnalyzerVerifyOpts) verifyAnalyzer() (err error) {
	var analyzerTOMLValidationErrors *validator.ValidationFailure
	var issuesValidationErrors *[]validator.ValidationFailure
	configurationValid := true

	/* ==================================================================================
	 * Checks for the presence of .deepsource/analyzer directory,
	 * the analyzer.toml file and issues present in .deepsource/analyzer/issues directory
	 * ================================================================================== */

	a.Spinner.StartSpinnerWithLabel("Checking for presence of analyzer.toml and issue descriptions...", "Found analyzer.toml and issue descriptions")
	if err = validator.CheckForAnalyzerConfig(analyzerTOMLPath, issuesDirPath); err != nil {
		configurationValid = false
		a.Spinner.StopSpinnerWithError("Failed to locate analyzer configurations", err)
		return
	}
	a.Spinner.StopSpinner()

	/* ==============================
	 * Read and verify analyzer.toml
	 * ============================== */

	a.Spinner.StartSpinnerWithLabel("Validating analyzer.toml...", "Verified analyzer.toml")
	a.AnalyzerTOMLData, analyzerTOMLValidationErrors, err = validator.ValidateAnalyzerTOML(analyzerTOMLPath)
	// TODO: Handle err here
	if err != nil {
		configurationValid = false
		a.Spinner.StopSpinnerWithError("Failed to verify analyzer.toml", err)
	}

	// Check for validation errors in analyzer.toml and display them (if any)
	if analyzerTOMLValidationErrors != nil && len(analyzerTOMLValidationErrors.Errors) > 0 {
		configurationValid = false
		a.Spinner.StopSpinnerWithError("Failed to verify analyzer.toml", err)
		for _, err := range analyzerTOMLValidationErrors.Errors {
			fmt.Printf("  %s\n", utils.GetBulletMessage(err.Message, "red"))
		}
	}
	a.Spinner.StopSpinner()

	/* ====================================
	 * Read and verify issue descriptions
	 * ==================================== */

	a.Spinner.StartSpinnerWithLabel("Validating issue descriptions...", "Verified issue descriptions")
	if issuesValidationErrors, err = validator.ValidateIssueDescriptions(issuesDirPath); err != nil {
		configurationValid = false
		a.Spinner.StopSpinnerWithError("Failed to validate the issues", err)
	}

	// Check for validation errors in analyzer issues and display them (if any)
	if issuesValidationErrors != nil && len(*issuesValidationErrors) > 0 {
		configurationValid = false
		a.Spinner.StopSpinnerWithError("Failed to validate the following issues", err)
		for _, validationError := range *issuesValidationErrors {
			fmt.Printf("  > %s\n", validationError.File)
			for _, err := range validationError.Errors {
				failureMsg := utils.GetBulletMessage(err.Message, "red")
				fmt.Printf("    %s\n", failureMsg)
			}
		}
	}
	a.Spinner.StopSpinner()

	// Do not proceed to building the image if the configuration verification fails
	if !configurationValid {
		return fmt.Errorf("verification failed")
	}

	/* ====================================================
	 * Verify the local docker image build of the Analyzer
	 * ==================================================== */

	return a.verifyAnalyzerDockerBuild()
}
