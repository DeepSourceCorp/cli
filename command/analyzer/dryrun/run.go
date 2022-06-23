package dryrun

import (
	"encoding/json"
	"fmt"
	"os"
	"path"

	"github.com/deepsourcelabs/cli/types"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/fatih/color"
	"github.com/morikuni/aec"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"

	"github.com/deepsourcelabs/cli/analysis/config"
	"github.com/deepsourcelabs/cli/analyzers/backend/docker"
)

// Variables to hold the value of CODE_PATH and TOOLBOX_PATH to be injected
// into the analysis container
var (
	containerCodePath    string
	containerToolBoxPath string
	analysisConfigName   string = "analysis_config"
	analysisResultsName  string = "analysis_results"
	analysisConfigExt    string = ".json"
	analysisResultsExt   string = ".json"
)

// The params required while running the Analysis locally.
type AnalyzerDryRun struct {
	Client               *docker.DockerClient   // The client to be used for all docker related ops.
	RemoteSource         bool                   // True if the source to be analyzed is a remote VCS repository.
	SourcePath           string                 // The path of the directory of source code to be analyzed.
	TempCloneDirectory   string                 // The temporary directory where the source of the remote VCS will be cloned to.
	TempToolBoxDirectory string                 // The temporary directory where the analysis_config is present.
	AnalysisFiles        []string               // The list of analysis files.
	AnalysisConfig       *config.AnalysisConfig // The analysis_config.json file containing the meta for analysis.
	AnalysisResult       types.AnalysisResult   // The analysis result received after post processing Analyzer report.
	Spinner              *utils.SpinnerUtils
}

func NewCmdAnalyzerRun() *cobra.Command {
	// Setting the current working directory as the default path of the source to be analyzed
	cwd, _ := os.Getwd()

	// Initializing the run params and setting defaults
	opts := AnalyzerDryRun{
		Spinner:      &utils.SpinnerUtils{},
		SourcePath:   cwd,
		RemoteSource: false,
	}

	cmd := &cobra.Command{
		Use:   "dry-run",
		Short: "Dry run the DeepSource Analyzer locally",
		Args:  utils.MaxNArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			if len(args) > 0 {
				opts.SourcePath = args[0]
			}
			if err := opts.AnalyzerRun(); err != nil {
				return fmt.Errorf("Failed to run the Analyzer. Error: %s", err)
			}
			return nil
		},
	}

	// --output-file/ -o flag
	cmd.Flags().StringVarP(&opts.TempToolBoxDirectory, "output-file", "o", "", "The path of analysis results")
	return cmd
}

// AnalyzerRun runs the Analyzer locally on a certain directory or repository.
func (a *AnalyzerDryRun) AnalyzerRun() (err error) {
	err = a.createDockerClient()
	if err != nil {
		return err
	}

	// Building the Analyzer image
	a.Spinner.StartSpinnerWithLabel("Building Analyzer image...", "Built Analyzer image")
	ctxCancelFunc, buildRespReader, buildError := a.Client.BuildAnalyzerDockerImage()

	// Cancel the build context and close the reader before exiting this function
	if buildRespReader != nil {
		defer buildRespReader.Close()
	}
	defer ctxCancelFunc()
	if buildError != nil {
		a.Spinner.StopSpinnerWithError("Failed to build the Analyzer image", err)
		return buildError
	}

	// Check the docker build response
	if err = docker.CheckBuildResponse(buildRespReader, false); err != nil {
		a.Spinner.StopSpinnerWithError("Failed to build the Analyzer image", err)
		return err
	}
	a.Spinner.StopSpinner()

	// Create temporary toolbox directory to store analysis config and later analyis results
	// If already passed through --output-file flag, use that one
	a.Spinner.StartSpinnerWithLabel("Creating temporary toolbox directory...", "Temporary toolbox directory created")
	if err = a.createTemporaryToolBoxDir(); err != nil {
		a.Spinner.StopSpinnerWithError("Failed to create temporary toolbox directory", err)
		return err
	}
	a.Spinner.StopSpinner()

	// Resolve the path of source code to be analyzed based on the user input
	a.Spinner.StartSpinnerWithLabel("Resolving the path of source code to be analyzed...", "")
	if a.Client.AnalysisOpts.HostCodePath, err = a.resolveAnalysisCodePath(); err != nil {
		a.Spinner.StopSpinnerWithError("Failed to resolve path of source code to be analyzed", err)
		return err
	}
	a.Spinner.StopSpinner()

	// Generate the analysis_config.json file
	// Also, write the analysis_config data into a temp /toolbox directory to be mounted into the container
	a.Spinner.StartSpinnerWithLabel("Generating analysis config...", fmt.Sprint("Analysis config (analysis_config.json) generated at ", path.Join(a.TempToolBoxDirectory, "analysis_config.json")))
	if err = a.prepareAnalysisConfig(); err != nil {
		a.Spinner.StopSpinnerWithError("Failed to generate analysis_config.json", err)
		return err
	}
	a.Spinner.StopSpinner()

	// Write the analysis_config.json to local toolbox directory
	if err = a.writeAnalysisConfig(); err != nil {
		a.Spinner.StopSpinnerWithError("Failed to write analysis_config.json", err)
		return err
	}
	a.Spinner.StopSpinner()

	// Starts the Docker container which analyzes the code and stores the analysis results
	// in a variable

	fmt.Println(aec.Apply("[+] Starting the Analysis container", aec.LightYellowF))
	if err = a.Client.StartDockerContainer(); err != nil {
		return err
	}

	// Fetch the analysis results
	a.Spinner.StartSpinnerWithLabel("Fetching Analyzer report...", "Successfully fetched Analyzer report")
	analysisResultBuf, analysisResultFileName, err := a.Client.FetchAnalysisResults()
	if err != nil {
		a.Spinner.StopSpinnerWithError("Failed to fetch Analyzer report", err)
		return err
	}
	a.Spinner.StopSpinner()

	// Write the analysis results to the file
	a.Spinner.StartSpinnerWithLabel("Writing Analyzer report...", fmt.Sprintf("Analyzer report written to %s", path.Join(a.Client.AnalysisOpts.AnalysisResultsPath, analysisResultFileName)))
	if err = a.writeAnalysisResults(analysisResultBuf, analysisResultFileName); err != nil {
		a.Spinner.StopSpinnerWithError("Failed to write Analyzer report", err)
		return err
	}
	a.Spinner.StopSpinner()

	// Process the analyzer report once it is received.
	a.Spinner.StartSpinnerWithLabel("Processing Analyzer report...", "Successfully processed Analyzer report")
	if a.AnalysisResult, err = a.processAnalyzerReport(analysisResultBuf); err != nil {
		a.Spinner.StopSpinnerWithError("Failed to process Analyzer report", err)
		return err
	}
	a.Spinner.StopSpinner()
	fmt.Println(aec.Apply(fmt.Sprintf("[✔] Issues after processing: %d", len(a.AnalysisResult.Issues)), aec.LightGreenF))

	b, _ := json.Marshal(a.AnalysisResult)
	if err = os.WriteFile("analysis_result.json", b, 0o750); err != nil {
		return err
	}

	// Print the user code and the permission to open browser at verificationURI
	c := color.New(color.FgCyan, color.Bold)
	c.Printf("Press enter to view the analysis results in the browser...")
	fmt.Scanln()

	pterm.Success.Print("Analysis results live at http://localhost:8080...")
	// Showcase the results on the browser
	return a.renderResultsOnBrowser()
}
