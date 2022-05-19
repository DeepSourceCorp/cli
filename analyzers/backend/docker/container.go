package docker

import (
	"context"
	"fmt"
	"io"
	"os"
	"strings"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/network"
	v1 "github.com/opencontainers/image-spec/specs-go/v1"
)

/* Starts the Docker container that contains the analyis code and the code
 * to be analyzed */
func (d *DockerClient) StartDockerContainer() {
	// Prepare the container config
	config := container.Config{
		Image: fmt.Sprintf("%s:%s", d.ImageName, d.ImageTag),
		Cmd:   strings.Split(d.AnalysisOpts.AnalysisCommand, " "),
	}

	hostConfig := container.HostConfig{
		Binds: []string{fmt.Sprintf("%s:%s", d.AnalysisOpts.HostCodePath, d.AnalysisOpts.ContainerCodePath)},
	}

	networkConfig := network.NetworkingConfig{}
	platform := v1.Platform{
		Architecture: "amd64",
		OS:           "linux",
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*120)
	defer cancel()
	containerCreateResp, err := d.Client.ContainerCreate(ctx, &config, &hostConfig, &networkConfig, &platform, d.ContainerName)
	if err != nil {
		fmt.Println(err)
	}

	// Start the container
	containerOpts := types.ContainerStartOptions{}
	err = d.Client.ContainerStart(ctx, containerCreateResp.ID, containerOpts)
	if err != nil {
		fmt.Println(err)
	}

	// Show container logs
	// TODO: Check if the logs are needed only in --verbose/--debug mode?
	reader, err := d.Client.ContainerLogs(ctx, containerCreateResp.ID, types.ContainerLogsOptions{ShowStdout: true, ShowStderr: true, Follow: true, Timestamps: false})
	if err != nil {
		fmt.Println(err)
		return
	}

	_, err = io.Copy(os.Stdout, reader)
	if err != nil && err != io.EOF {
		return
	}

	// If no error is found from the above step, copy the analysis results file to the host
}
