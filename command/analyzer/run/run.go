package run

import (
	"fmt"
	"os"

	"github.com/deepsourcelabs/cli/utils"
	"github.com/spf13/cobra"

	"github.com/deepsourcelabs/cli/analyzers/backend/docker"
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
	// analysisResultPath   string
)

// The params required while running the Analysis locally
type AnalyzerRunOpts struct {
	Client               *docker.DockerClient
	RemoteSource         bool            // True if the source to be analyzed is a remote VCS repository
	SourcePath           string          // The path of the directory of source code to be analyzed
	AnalysisFiles        []string        // The list of analysis files
	AnalysisConfig       *AnalysisConfig // The analysis_config.json file containing the meta for analysis
	TempCloneDirectory   string          // The temporary directory where the source of the remote VCS will be cloned to
	TempToolBoxDirectory string          // The temporary directory where the analysis_config is present
	// AnalysisResultsPath  string
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
	if err := a.Client.BuildAnalyzerDockerImage(); err != nil {
		return err
	}

	// Prepare the source code to be analyzed and generate the analysis_config.json file
	if err = a.prepareSourceForAnalysis(); err != nil {
		return err
	}

	/* Write the analysis_results.json file locally to the temporary
	 * toolbox directory created */
	a.Client.AnalysisOpts.HostToolBoxPath = a.TempToolBoxDirectory
	a.Client.AnalysisOpts.AnalysisResultsPath = a.TempToolBoxDirectory

	// Write the analysis_config data into a temp /toolbox directory mount it as well
	if err = a.Client.StartDockerContainer(); err != nil {
		return err
	}

	// Process the analysis_results.json file generated after analysis
	if err = a.processAnalysisResult(); err != nil {
		return err
	}

	return nil
}
