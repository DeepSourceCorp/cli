package run

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path"
	"strings"

	"github.com/deepsourcelabs/cli/analyzers/config"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/go-git/go-git/v5"
	"github.com/spf13/cobra"

	analysis_config "github.com/deepsourcelabs/cli/analysis/config"
	docker_build "github.com/deepsourcelabs/cli/analyzers/backend/docker"
)

// Variables to hold the value of CODE_PATH and TOOLBOX_PATH to be injected
// into the analysis container
var (
	containerCodePath    string = "/code"
	containerToolBoxPath string = "/toolbox"
	analysisResultPath   string
)

// The params required while running the Analysis locally
type AnalyzerRunOpts struct {
	RemoteSource         bool            // True if the source to be analyzed is a remote VCS repository
	SourcePath           string          // The path of the directory of source code to be analyzed
	AnalysisFiles        []string        // The list of analysis files
	AnalysisConfig       *AnalysisConfig // The analysis_config.json file containing the meta for analysis
	TempCloneDirectory   string          // The temporary directory where the source of the remote VCS will be cloned to
	TempToolBoxDirectory string          // The temporary directory where the analysis_config is present
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
// TODO: Refactor this function into smaller components
func (a *AnalyzerRunOpts) AnalyzerRun() error {
	// Get the Analyzer.toml contents
	analyzerTOMLData, err := config.GetAnalyzerTOML()
	if err != nil {
		return err
	}

	// Extracting the docker file and path details
	dockerFilePath, dockerFileName := docker_build.GetDockerImageDetails(analyzerTOMLData)
	analyzerName := strings.Split(dockerFileName, "/")[1]

	/* Check if the user supplied CODE_PATH and TOOLBOX_PATH, if not
	 * use the default values of CODE_PATH and TOOLBOX_PATH */
	if _, envVarPresent := os.LookupEnv("CODE_PATH"); envVarPresent {
		containerCodePath = os.Getenv("CODE_PATH")
	}
	if _, envVarPresent := os.LookupEnv("TOOLBOX_PATH"); envVarPresent {
		containerToolBoxPath = os.Getenv("CODE_PATH")
	}

	// Create a Docker client
	d := docker_build.DockerClient{
		ImageName:      dockerFileName,
		ImageTag:       docker_build.GenerateImageVersion(7),
		ContainerName:  analyzerName + "-" + docker_build.GenerateImageVersion(7),
		DockerfilePath: dockerFilePath,
		AnalysisOpts: docker_build.AnalysisParams{
			AnalysisCommand:      analyzerTOMLData.Analysis.Command,
			ContainerCodePath:    containerCodePath,    // /code
			ContainerToolBoxPath: containerToolBoxPath, // /toolbox
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

	/* Prepare the analysis_config.json here and mount into the container at `TOOLBOX_PATH/analysis_config.json`
	 * The analysis_config.json will have path prepended with the CODE_PATH of the container and not local CODE_PATH */
	analysisRun := analysis_config.AnalysisRun{
		AnalyzerName:      analyzerTOMLData.Name,
		LocalCodePath:     d.AnalysisOpts.HostCodePath,
		ContainerCodePath: containerCodePath,
	}

	analysisConfig, err := analysisRun.ConfigureAnalysis()
	if err != nil {
		log.Println(err)
	}

	// Modify the paths of analysis_config.json file to use the container based CODE_PATH instead
	// of the local CODE_PATH
	modifyAnalysisConfigFilepaths(analysisConfig, d.AnalysisOpts.HostCodePath, d.AnalysisOpts.ContainerCodePath)

	// Write the analysis_config.json to TOOLBOX_PATH
	if err = a.writeAnalysisConfig(analysisConfig); err != nil {
		return err
	}
	d.AnalysisOpts.HostToolBoxPath = a.TempToolBoxDirectory

	// Write the analysis_config data into a temp /toolbox directory mount it as well
	d.StartDockerContainer()

	// Reads the LSP based analysis result written in the `analysis_results.json` file present in
	// the directory of the Analyzer
	analysisResultsData, err := os.ReadFile("analysis_results.json")
	if err != nil {
		return err
	}

	// Unmarshal the analysis result data present in the LSP format
	analysisResultContent := analysis_config.AnalysisResult{}
	if err = json.Unmarshal(analysisResultsData, &analysisResultContent); err != nil {
		return err
	}

	// Format the LSP based results to the default format supported by DeepSource
	analysisResult := analysisRun.FormatLSPResultToDefault(&analysisResultContent)

	res, _ := json.Marshal(analysisResult)
	os.WriteFile("analysis_results_default.json", res, 0o644)

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

// Writes the analysis_config.json into a temporary directory which shall be mounted as TOOLBOX directory in the container
func (a *AnalyzerRunOpts) writeAnalysisConfig(analysisConfig *analysis_config.AnalysisConfig) (err error) {
	// Create a temporary directory
	if a.TempToolBoxDirectory, err = os.MkdirTemp("/tmp", "toolbox"); err != nil {
		return err
	}

	// Marshal the analysis_config data into JSON
	analysisConfigJSON, err := json.Marshal(analysisConfig)
	if err != nil {
		return err
	}

	// Create a temporary directory
	fmt.Printf("Writing analysis_config to %s\n", a.TempToolBoxDirectory)
	return os.WriteFile(path.Join(a.TempToolBoxDirectory, "analysis_config.json"), analysisConfigJSON, 0o644)
}
