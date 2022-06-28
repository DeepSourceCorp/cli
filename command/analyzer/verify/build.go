package verify

import (
	"errors"
	"fmt"
	"os"

	build "github.com/deepsourcelabs/cli/analyzers/backend/docker"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/mgutz/ansi"
)

// Verify the docker image build of the Analyzer
func (a *AnalyzerVerifyOpts) verifyAnalyzerDockerBuild() (err error) {
	// Fetch the details of the dockerfile to build and also the name of the docker image
	a.Build.DockerFilePath, a.Build.DockerImageName = build.GetDockerImageDetails(a.AnalyzerTOMLData)

	/* In case of verbose mode (when the user supplies a `--verbose` flag), do not use spinner since it doesn't allow showing multiline
	 * output at the same time as rendering a spinner. Can be done but would require some string concatenation magic. Can be picked up later. */
	switch a.Build.VerboseMode {
	case true:
		arrowIcon := ansi.Color("> [verbose]", "yellow")
		fmt.Printf("%s Building Analyzer image with the name \"%s\"\n", arrowIcon, a.Build.DockerImageName)
	case false:
		a.Spinner.StartSpinnerWithLabel(fmt.Sprintf("Building Analyzer image with the name \"%s\"", a.Build.DockerImageName), "Successfully built the Analyzer image")
	}

	/* Specifying the source to build
	 * Check for the presence of `build.Dockerfile` or if not a `Dockerfile` in the current working directory */
	if _, err := os.Stat(a.Build.DockerFilePath); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			if a.Build.VerboseMode {
				msg := utils.GetFailureMessage("Failed to build the image", fmt.Sprintf("%s not found", a.Build.DockerFilePath))
				fmt.Println(msg)
				return fmt.Errorf(msg)
			}
			a.Spinner.StopSpinnerWithError("Failed to build the image", fmt.Errorf("%s not found", a.Build.DockerFilePath))
			return err
		}
	}

	/* ===================================
	 * Analyzer docker build verification
	 * =================================== */

	/* Initialize the builder with the above fetched details
	 * Use the `GenerateImageVersion` utility to generate a random string of length 7 to tag the image */
	analyzerBuilder := build.DockerClient{
		ImageName:      a.Build.DockerImageName,
		ImagePlatform:  a.Build.DockerImagePlatform,
		DockerfilePath: a.Build.DockerFilePath,
		ImageTag:       build.GenerateImageVersion(7),
		ShowLogs:       a.Build.VerboseMode,
	}

	// Build the docker image :rocket:
	ctxCancelFunc, buildRespReader, buildErr := analyzerBuilder.BuildAnalyzerDockerImage()

	// Cancel the build context and close the reader before exiting this function
	if buildRespReader != nil {
		defer buildRespReader.Close()
	}
	if ctxCancelFunc != nil {
		defer ctxCancelFunc()
	}

	if buildErr != nil {
		a.handleBuildError(buildErr)
		return buildErr
	}

	// Read the docker build response
	if err = build.CheckBuildResponse(buildRespReader, a.Build.VerboseMode); err != nil {
		a.handleBuildError(err)
		return err
	}

	// In case of verbose mode, no need to stop the spinner
	if a.Build.VerboseMode {
		fmt.Print(utils.GetSuccessMessage("Successfully built the Analyzer image\n"))
		return nil
	}
	a.Spinner.StopSpinner()
	return nil
}

// Utility to handle the output in case of build errors for different modes
func (a *AnalyzerVerifyOpts) handleBuildError(buildError error) {
	if a.Build.VerboseMode {
		fmt.Printf("%s\n", utils.GetFailureMessage("Failed to build the image", buildError.Error()))
		return
	}
	a.Spinner.StopSpinnerWithError("Failed to build the image", fmt.Errorf(buildError.Error()))
}
