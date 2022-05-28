package run

import (
	"fmt"
	"os"

	"github.com/deepsourcelabs/cli/utils"
	"github.com/spf13/cobra"

	analysis_config "github.com/deepsourcelabs/cli/analysis/config"
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

// The params required while running the Analysis locally
type AnalyzerDryRun struct {
	Client               *docker.DockerClient // The client to be used for all docker related ops
	RemoteSource         bool                 // True if the source to be analyzed is a remote VCS repository
	SourcePath           string               // The path of the directory of source code to be analyzed
	AnalysisFiles        []string             // The list of analysis files
	TempCloneDirectory   string               // The temporary directory where the source of the remote VCS will be cloned to
	TempToolBoxDirectory string               // The temporary directory where the analysis_config is present

	AnalysisConfig *analysis_config.AnalysisConfig // The analysis_config.json file containing the meta for analysis
}

func NewCmdAnalyzerRun() *cobra.Command {
	// Setting the current working directory as the default path of the source to be analyzed
	cwd, _ := os.Getwd()

	// Initializing the run params and setting defaults
	opts := AnalyzerDryRun{
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

// Run the Analyzer locally on a certain directory or repository
func (a *AnalyzerDryRun) AnalyzerRun() (err error) {
	// runtime.Breakpoint()
	err = a.createDockerClient()
	if err != nil {
		return err
	}

	// Building the Analyzer image
	fmt.Println("Building Analyzer image...")
	ctxCancelFunc, buildRespReader, buildError := a.Client.BuildAnalyzerDockerImage()

	// Cancel the build context and close the reader before exiting this function
	if buildRespReader != nil {
		defer buildRespReader.Close()
	}
	defer ctxCancelFunc()
	if buildError != nil {
		return buildError
	}

	// Check the docker build response
	// TODO: Tweak the behaviour here when the spinners are added to the run command
	if err = docker.CheckBuildResponse(buildRespReader, false); err != nil {
		return err
	}

	/* Create temporary toolbox directory to store analysis config and later analyis results
	 * If already passed through --output-file flag, use that one */
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

	/* Starts the Docker container which analyzes the code and stores the analysis results
	 * in a variable */
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
