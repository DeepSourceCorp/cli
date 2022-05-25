package run

import (
	"fmt"
	"os"

	"github.com/deepsourcelabs/cli/utils"
	"github.com/spf13/cobra"

	"github.com/deepsourcelabs/cli/analyzers/backend/docker"

	analysis_config "github.com/deepsourcelabs/cli/analysis/config"
)

// Variables to hold the value of CODE_PATH and TOOLBOX_PATH to be injected
// into the analysis container
var (
	containerCodePath    string = "/code"
	containerToolBoxPath string = "/toolbox"
	analysisConfigName   string = "analysis_config"
	analysisResultsName  string = "analysis_results"
	analysisConfigExt    string = ".json"
	analysisResultsExt   string = ".json"
)

// The params required while running the Analysis locally
type AnalyzerRunOpts struct {
	Client               *docker.DockerClient
	RemoteSource         bool     // True if the source to be analyzed is a remote VCS repository
	SourcePath           string   // The path of the directory of source code to be analyzed
	AnalysisFiles        []string // The list of analysis files
	TempCloneDirectory   string   // The temporary directory where the source of the remote VCS will be cloned to
	TempToolBoxDirectory string   // The temporary directory where the analysis_config is present

	AnalysisConfig *analysis_config.AnalysisConfig // The analysis_config.json file containing the meta for analysis
}

func NewCmdAnalyzerRun() *cobra.Command {
	// Setting the current working directory as the default path of the source to be analyzed
	cwd, _ := os.Getwd()

	// Initializing the run params and setting defaults
	opts := AnalyzerRunOpts{
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
	return cmd
}

// Run the Analyzer locally on a certain directory or repository
func (a *AnalyzerRunOpts) AnalyzerRun() (err error) {
	// runtime.Breakpoint()
	err = a.createDockerClient()
	if err != nil {
		return err
	}

	// Building the Analyzer image
	fmt.Println("Building Analyzer image...")
	if buildError := a.Client.BuildAnalyzerDockerImage(); buildError != nil {
		return buildError
	}

	// Create temporary toolbox directory to store analysis config and later analyis results
	if err = a.createTemporaryToolBoxDir(); err != nil {
		return err
	}

	// Resolve the path of source code to be analyzed based on the user input
	a.Client.AnalysisOpts.HostCodePath, err = a.resolveAnalysisCodePath()
	if err != nil {
		return err
	}

	/* Generate the analysis_config.json file
	 * Also, write the analysis_config data into a temp /toolbox directory to be mounted into the container */
	if err = a.prepareAnalysisConfig(); err != nil {
		return err
	}

	// Write the analysis_config.json to local toolbox directory
	if err = a.writeAnalysisConfig(); err != nil {
		return err
	}

	// Starts the Docker container which analyzes the code and stores the analysis results
	// in a variable
	if err = a.Client.StartDockerContainer(); err != nil {
		return err
	}

	// Fetch the analysis results
	analysisResultBuf, analysisResultFileName, err := a.Client.FetchAnalysisResults()
	if err != nil {
		return err
	}

	// Write the analysis results to the file
	return a.writeAnalysisResults(analysisResultBuf, analysisResultFileName)
}
