package run

import (
	"fmt"
	"os"
	"strings"

	docker_build "github.com/deepsourcelabs/cli/analyzers/backend/docker"
	"github.com/deepsourcelabs/cli/analyzers/config"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/go-git/go-git/v5"
	"github.com/spf13/cobra"
)

type AnalyzerRunOpts struct {
	SourcePath    string
	RemoteSource  bool
	CloneDir      string
	AnalysisFiles []string
}

func NewCmdAnalyzerRun() *cobra.Command {
	// Setting the current working directory as the default
	// path of the source to be analyzed
	cwd, _ := os.Getwd()
	opts := AnalyzerRunOpts{
		SourcePath:   cwd,
		RemoteSource: false,
		CloneDir:     "",
	}

	cmd := &cobra.Command{
		Use:   "run",
		Short: "Run DeepSource Analyzer locally",
		Args:  utils.ExactArgs(1),
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

func (a *AnalyzerRunOpts) AnalyzerRun() error {
	// Get the Analyzer.toml contents
	analyzerTOMLData, err := config.GetAnalyzerTOML()
	if err != nil {
		return err
	}

	// Build the latest Analyzer image
	dockerFilePath, dockerFileName := docker_build.GetDockerImageDetails(analyzerTOMLData)
	analyzerName := strings.Split(dockerFileName, "/")[1]
	d := docker_build.DockerClient{
		ContainerName:  analyzerName + "-" + docker_build.GenerateImageVersion(7),
		ImageName:      dockerFileName,
		DockerfilePath: dockerFilePath,
		ImageTag:       docker_build.GenerateImageVersion(7),
		AnalysisOpts: docker_build.AnalysisParams{
			AnalysisCommand:   analyzerTOMLData.Analysis.Command,
			ContainerCodePath: "/code",
		},
	}

	fmt.Println("Building Analyzer image...")
	if err := d.BuildAnalyzerDockerImage(); err != nil {
		return err
	}

	/* Resolve the code to analyze
	 * The user passes it as an argument to the command `deepsource analyzer run <directory/repository URL>`
	 * Parse the argument and check if its a URL, if not then resolve the local directory path */
	if isValidUrl(a.SourcePath) {
		a.RemoteSource = true

		/* Clone the repository to a temporary directory
		 * TODO: Check here if /tmp directory actually exists. Also, take care of Windows please?
		 * Create a temp directory to clone the source code into */
		a.CloneDir, err = os.MkdirTemp("", "code")
		if err != nil {
			return err
		}
		defer os.RemoveAll(a.CloneDir)

		fmt.Printf("Cloning %s to %s\n", a.SourcePath, a.CloneDir)
		if _, err := git.PlainClone(a.CloneDir, false, &git.CloneOptions{
			URL:      a.SourcePath,
			Depth:    1,
			Progress: os.Stdout,
		}); err != nil {
			return err
		}
	}

    /* Start listing the files for analysis
     * a.AnalysisFiles, err = getFilesToAnalyze(a.SourcePath)
     * if err != nil {
     *     return err
     * }
     * analysisConfig := AnalysisConfig{
     *     Files: a.AnalysisFiles,
     * } */
	d.AnalysisOpts.HostCodePath = a.CloneDir

	// Create a container and start it using the above docker DockerClient
	d.StartDockerContainer()

	return nil
}
