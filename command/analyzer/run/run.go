package run

import (
	"fmt"
	"log"
	"os"
	"path"
	"strings"

	analysis "github.com/deepsourcelabs/cli/analysis/config"
	docker_build "github.com/deepsourcelabs/cli/analyzers/backend/docker"
	"github.com/deepsourcelabs/cli/analyzers/config"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/go-git/go-git/v5"
	"github.com/spf13/cobra"
)

// Reading the values of CODE_PATH and TOOLBOX_PATH from the user's environment
var (
	containerCodePath    string = os.Getenv("CODE_PATH")
	containerToolBoxPath string = os.Getenv("TOOLBOX_PATH")
	analysisResultPath   string = path.Join(containerToolBoxPath, "analysis_results.json")
)

// The params required while running the Analysis locally
type AnalyzerRunOpts struct {
	SourcePath         string          // The path of the directory of source code to be analyzed
	RemoteSource       bool            // True if the source to be analyzed is a remote VCS repository
	TempCloneDirectory string          // The temporary directory where the source of the remote VCS will be cloned to
	AnalysisFiles      []string        // The list of analysis files
	AnalysisConfig     *AnalysisConfig // The analysis_config.json file containing the meta for analysis
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
func (a *AnalyzerRunOpts) AnalyzerRun() error {
	// Get the Analyzer.toml contents
	analyzerTOMLData, err := config.GetAnalyzerTOML()
	if err != nil {
		return err
	}

	// Extracting the docker file and path details
	dockerFilePath, dockerFileName := docker_build.GetDockerImageDetails(analyzerTOMLData)
	analyzerName := strings.Split(dockerFileName, "/")[1]

	// Create a Docker client
	d := docker_build.DockerClient{
		ImageName:      dockerFileName,
		ImageTag:       docker_build.GenerateImageVersion(7),
		ContainerName:  analyzerName + "-" + docker_build.GenerateImageVersion(7),
		DockerfilePath: dockerFilePath,
		AnalysisOpts: docker_build.AnalysisParams{
			AnalysisCommand:   analyzerTOMLData.Analysis.Command,
			ContainerCodePath: containerCodePath,    // /code
			ToolboxPath:       containerToolBoxPath, // /toolbox
		},
	}

	// Building the Analyzer image
	fmt.Println("Building Analyzer image...")
	if err := d.BuildAnalyzerDockerImage(); err != nil {
		return err
	}

	// Resolve the path of source code to be analyzed based on the user input
	d.AnalysisOpts.HostCodePath, err = a.resolveAnalysisSourcePath()
	if err != nil {
		return err
	}

	// TODO here: Prepare the analysis_config.json here and mount into the container at `TOOLBOX_PATH/analysis_config.json`
	// The analysis_config.json will have path prepended with the CODE_PATH of the container and not local CODE_PATH
	analysisRun := analysis.AnalysisRun{
		AnalyzerName:      analyzerTOMLData.Name,
		LocalCodePath:     d.AnalysisOpts.HostCodePath,
		ContainerCodePath: containerCodePath,
	}

	analysisConfig, err := analysisRun.ConfigureAnalysis()
	if err != nil {
		log.Println(err)
	}
	fmt.Println(analysisConfig)

	// Write the analysis_config data into a temp /toolbox directory mount it as well
	// d.StartDockerContainer()
	return nil
}

/* Resolves the code to be analyzed by the Analyzer.
 * The user passes it as an argument to the command `deepsource analyzer run <directory/repository URL>`
 * Parse the argument and check if its a URL, if not then resolve the local directory path */
func (a *AnalyzerRunOpts) resolveAnalysisSourcePath() (string, error) {
	var err error

	// Check if the source path is a valid VCS URL
	if isValidUrl(a.SourcePath) {
		a.RemoteSource = true

		// Clone the repository to a temporary directory
		// TODO: Check here if /tmp directory actually exists. Also, take care of Windows please?
		a.TempCloneDirectory, err = os.MkdirTemp("", "code")
		if err != nil {
			return "", err
		}

		fmt.Printf("Cloning %s to %s\n", a.SourcePath, a.TempCloneDirectory)
		if _, err := git.PlainClone(a.TempCloneDirectory, false, &git.CloneOptions{
			URL:      a.SourcePath,
			Depth:    1,
			Progress: os.Stdout,
		}); err != nil {
			return "", err
		}
		return a.TempCloneDirectory, nil
	}
	return a.SourcePath, nil
}
