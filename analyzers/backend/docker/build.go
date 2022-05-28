package docker

import (
	"context"
	"crypto/rand"
	"fmt"
	"io"
	"os"
	"strings"
	"time"

	"github.com/deepsourcelabs/cli/analyzers/config"
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/archive"
)

// Timeout for build and container operations (10 minutes)
const buildTimeout = 10 * time.Minute

type DockerClient struct {
	Client         *client.Client
	ContainerName  string
	ContainerID    string
	ImageName      string
	ImageTag       string
	DockerfilePath string
	AnalysisOpts   AnalysisParams
	ShowLogs       bool
}

type DockerBuildError struct {
	Message string
}

func (d *DockerBuildError) Error() string {
	return d.Message
}

// Docker build API function
func (d *DockerClient) BuildAnalyzerDockerImage() (context.CancelFunc, io.ReadCloser, *DockerBuildError) {
	var err error
	d.Client, err = client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		return nil, nil, &DockerBuildError{
			Message: err.Error(),
		}
	}

	cancelFunc, responseReader, err := d.executeImageBuild()
	if err != nil {
		return cancelFunc, nil, &DockerBuildError{
			Message: err.Error(),
		}
	}
	return cancelFunc, responseReader, nil
}

// Executes the docker image build
func (d *DockerClient) executeImageBuild() (context.CancelFunc, io.ReadCloser, error) {
	ctx, ctxCancelFunc := context.WithTimeout(context.Background(), buildTimeout)
	cwd, _ := os.Getwd()

	tarOptions := &archive.TarOptions{
		ExcludePatterns: []string{".git/**"},
	}
	tar, err := archive.TarWithOptions(cwd, tarOptions)
	if err != nil {
		return ctxCancelFunc, nil, err
	}

	opts := types.ImageBuildOptions{
		Dockerfile: d.DockerfilePath,
		Tags:       []string{fmt.Sprintf("%s:%s", d.ImageName, d.ImageTag)},
		Remove:     true,
		Platform:   "linux",
	}
	res, err := d.Client.ImageBuild(ctx, tar, opts)
	if err != nil {
		ctxCancelFunc()
		return ctxCancelFunc, nil, err
	}
	return ctxCancelFunc, res.Body, nil
}

// Returns the docker image details to build
func GetDockerImageDetails(analyzerTOMLData *config.AnalyzerMetadata) (string, string) {
	var dockerFilePath, dockerFileName string
	dockerFilePath = "Dockerfile"

	// Read config for the value if specified
	if analyzerTOMLData.Build.Dockerfile != "" {
		dockerFilePath = analyzerTOMLData.Build.Dockerfile
	}

	// Removing the @ from the shortcode since docker build doesn't accept it as a valid image name
	if analyzerTOMLData.Shortcode != "" {
		dockerFileName = strings.TrimPrefix(analyzerTOMLData.Shortcode, "@")
	}
	return dockerFilePath, dockerFileName
}

func GenerateImageVersion(length int) string {
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return fmt.Sprintf("%x", b)
}
