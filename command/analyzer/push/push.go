package push

import (
	"fmt"
	"strings"

	"github.com/deepsourcelabs/cli/analyzers/backend/docker"
	"github.com/deepsourcelabs/cli/command/analyzer/verify"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/types"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

var (
	defaultRegistryURL    string = "registry.deepsource.io"
	analyzerImagePlatform string = "linux/amd64"
)

type AnalyzerPushOpts struct {
	RegistryURL      string
	AnalyzerTOMLData types.AnalyzerTOML
	IssuesData       *[]types.AnalyzerIssue
	DockerClient     *docker.DockerClient
	Spinner          *utils.SpinnerUtils //  The spinner command line utility.
	cliConfig        *config.CLIConfig
}

/* =============================================================
 * $ deepsource analyzer push
 *
 * Pushes the Analyzer image and configuration to DeepSource.
 * ============================================================== */
func NewCmdAnalyzerPush() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "push",
		Short:   "Push the Analyzer image and configuration to DeepSource",
		Args:    utils.MaxNArgs(1),
		PreRunE: verify.NewCmdAnalyzerVerify().RunE,
		RunE: func(_ *cobra.Command, _ []string) error {
			// Initialize the push utilities.
			a := AnalyzerPushOpts{
				Spinner: &utils.SpinnerUtils{},
			}

			if err := a.pushAndSyncAnalyzer(); err != nil {
				return fmt.Errorf("Failed to push the Analyzer changes to DeepSource.")
			}
			pterm.Success.Println("Analyzer push successful.")
			return nil
		},
	}
	return cmd
}

func (a *AnalyzerPushOpts) pushAndSyncAnalyzer() (err error) {
	if err = a.checkAuthentication(); err != nil {
		return err
	}
	if err = a.pushAnalyzer(); err != nil {
		return err
	}
	if err = a.syncAnalyzerData(); err != nil {
		return err
	}
	return nil
}

func (a *AnalyzerPushOpts) checkAuthentication() (err error) {
	// Get the DeepSource CLI config contents.
	a.Spinner.StartSpinnerWithLabel("Verifying CLI authentication...", "Verified CLI authentication")
	a.cliConfig, err = config.GetConfig()
	if err != nil {
		a.Spinner.StopSpinnerWithError("Failed to read the CLI authentication config", err)
		return fmt.Errorf("error while reading DeepSource CLI config : %v", err)
	}

	// Verify the DeepSource CLI authentication of the user.
	if err = a.cliConfig.VerifyAuthentication(); err != nil {
		a.Spinner.StopSpinnerWithError("Failed to verify authentication status", err)
		return err
	}
	a.Spinner.StopSpinner()
	return nil
}

// pushAnalyzer contains the pipeline to build the Analyzer image and then push it to
// the registry post authentication.
func (a *AnalyzerPushOpts) pushAnalyzer() (err error) {
	// Fetch docker registry URL and the data required to build the Analyzer image.
	a.Spinner.StartSpinnerWithLabel("Fetching Analyzer registry URL and image data...", "Fetched the Analyzer registry URL and image data")
	a.RegistryURL = getImageRegistryURL()
	if a.AnalyzerTOMLData, a.AnalyzerTOMLData.AnalyzerVersion, err = getAnalyzerData(); err != nil {
		a.Spinner.StopSpinnerWithError("Failed to fetch the image data", err)
		return err
	}
	a.Spinner.StopSpinner()

	// Build the Analyzer image using the received version.
	analyzerImageName := fmt.Sprintf("%s/%s:%s", a.RegistryURL, strings.TrimPrefix(a.AnalyzerTOMLData.Shortcode, "@"), a.AnalyzerTOMLData.AnalyzerVersion)
	a.Spinner.StartSpinnerWithLabel(fmt.Sprintf("Building the Analyzer image with the name %s", analyzerImageName), "Built the Analyzer image")
	if err = a.buildAnalyzerImage(a.AnalyzerTOMLData.AnalyzerVersion, &a.AnalyzerTOMLData); err != nil {
		a.Spinner.StopSpinnerWithError("Failed to build the image", err)
		return err
	}
	a.Spinner.StopSpinner()

	// Push the Analyzer image to the registry.
	a.Spinner.StartSpinnerWithLabel(fmt.Sprintf("Pushing the Analyzer image to DeepSource with the name %s", analyzerImageName), "Pushed the Analyzer image to DeepSource")
	if err = a.pushAnalyzerImage(a.cliConfig.User, a.cliConfig.Token); err != nil {
		a.Spinner.StopSpinnerWithError("Failed to push the image to DeepSource", err)
		return err
	}
	a.Spinner.StopSpinner()
	return nil
}

func (a *AnalyzerPushOpts) syncAnalyzerData() (err error) {
	// Run the data sync mutation.
	a.Spinner.StartSpinnerWithLabel(fmt.Sprintf("Syncing the latest changes in %s:%s", a.AnalyzerTOMLData.Shortcode, a.AnalyzerTOMLData.AnalyzerVersion), "Synced the latest changes")
	syncSuccessful, syncWarnings, err := a.syncAnalyzer(a.cliConfig.Host, a.cliConfig.Token)
	if err != nil {
		a.Spinner.StopSpinnerWithError("Failed to sync the Analyzer", err)
		return err
	}

	// Check if the Analyzer sync passed or failed.
	if !syncSuccessful {
		a.Spinner.StopSpinnerWithError("Failed to sync the Analyzer", err)
	} else {
		a.Spinner.StopSpinner()
	}

	// Check if there are any warnings in the response and handle print them accordingly.
	if len(syncWarnings) != 0 {
		for _, warning := range syncWarnings {
			warningMessage := utils.GetBulletMessage(warning, "yellow")
			fmt.Printf("    %s\n", warningMessage)
		}
	}
	return nil
}

// buildAnalyzerImage builds the Analyzer image and tags it with the latest git tag or commit (if tag not found).
func (a *AnalyzerPushOpts) buildAnalyzerImage(analyzerVersion string, analyzerTOMLData *types.AnalyzerTOML) error {
	// Fetch the details of the dockerfile to build and also the name of the docker image
	dockerFilePath, dockerImageName := docker.GetDockerImageDetails(analyzerTOMLData)

	// Initialize the builder with the above fetched details
	a.DockerClient = &docker.DockerClient{
		ImageName:      fmt.Sprintf("%s/%s", a.RegistryURL, dockerImageName),
		DockerfilePath: dockerFilePath,
		ImageTag:       analyzerVersion,
		ImagePlatform:  analyzerImagePlatform,
	}

	// Build the Analyzer docker image.
	ctxCancelFunc, buildRespReader, buildErr := a.DockerClient.BuildAnalyzerDockerImage()

	// Cancel the build context and close the reader before exiting this function.
	if buildRespReader != nil {
		defer buildRespReader.Close()
	}
	if ctxCancelFunc != nil {
		defer ctxCancelFunc()
	}
	if buildErr != nil {
		return buildErr
	}

	// Read the docker build response.
	// Passing `verboseMode` as false since its not required as of now in the `push` command.
	return docker.CheckResponse(buildRespReader, false)
}

// pushAnalyzerImage pushes the Analyzer image to the registry.
func (a *AnalyzerPushOpts) pushAnalyzerImage(user, token string) error {
	ctxCancelFunc, pushResponseReader, pushErr := a.DockerClient.PushImageToRegistry(user, token)
	if pushResponseReader != nil {
		defer pushResponseReader.Close()
	}
	if ctxCancelFunc != nil {
		defer ctxCancelFunc()
	}
	if pushErr != nil {
		return pushErr
	}

	// Read the docker push response.
	// Passing `verboseMode` as false since its not required as of now in the `push` command.
	return docker.CheckResponse(pushResponseReader, false)
}
