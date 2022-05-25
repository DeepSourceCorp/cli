package docker

import (
	"archive/tar"
	"context"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path"
	"strings"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/network"
	v1 "github.com/opencontainers/image-spec/specs-go/v1"
)

type AnalysisParams struct {
	AnalyzerName            string
	HostCodePath            string
	HostToolBoxPath         string
	AnalysisCommand         string
	ContainerCodePath       string
	ContainerToolBoxPath    string
	AnalysisResultsPath     string
	AnalysisResultsFilename string
}

/* Creates a Docker container with the volume mount in which the source code to be analyzed and the CMD instruction being the
 * analysis command configured by the user.
 * Having started the container, streams the logs to STDOUT. On completion of the streaming,
 * copies the `analysis_results.json` result file generated in the container to the host directory
 */
func (d *DockerClient) StartDockerContainer() error {
	/* ==========================================================
	     * Prepare the container config with the following data:
		 * - ImageName
		 * - CMD instruction
		 * - Environment variables
	     * ========================================================== */
	config := container.Config{
		Image: fmt.Sprintf("%s:%s", d.ImageName, d.ImageTag),
		Cmd:   strings.Split(d.AnalysisOpts.AnalysisCommand, " "),
		Env:   []string{"TOOLBOX_PATH:" + d.AnalysisOpts.ContainerToolBoxPath, "CODE_PATH:" + d.AnalysisOpts.ContainerCodePath},
	}

	/* Host config containing the mounted volumes
	 * The host machine's temporary code path and toolbox path is mounted in the container */
	hostConfig := container.HostConfig{
		Binds: []string{
			fmt.Sprintf("%s:%s", d.AnalysisOpts.HostCodePath, d.AnalysisOpts.ContainerCodePath),
			fmt.Sprintf("%s:%s", d.AnalysisOpts.HostToolBoxPath, d.AnalysisOpts.ContainerToolBoxPath),
		},
	}

	// Prepare the network config
	networkConfig := network.NetworkingConfig{}
	platform := v1.Platform{
		Architecture: "amd64",
		OS:           "linux",
	}

	/* ===================================================================
	 * Create container with the above configs and store the container ID
	 * =================================================================== */
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*120)
	defer cancel()
	containerCreateResp, err := d.Client.ContainerCreate(ctx, &config, &hostConfig, &networkConfig, &platform, d.ContainerName)
	if err != nil {
		return err
	}
	d.ContainerID = containerCreateResp.ID

	/* =========================================
	 * Start the container
	 * ========================================= */
	containerOpts := types.ContainerStartOptions{}
	err = d.Client.ContainerStart(ctx, containerCreateResp.ID, containerOpts)
	if err != nil {
		return err
	}

	/* ===================================================================
	 * Stream container logs to STDOUT
	 * TODO: Check if the logs are needed only in --verbose/--debug mode?
	 * =================================================================== */
	reader, err := d.Client.ContainerLogs(ctx, containerCreateResp.ID, types.ContainerLogsOptions{ShowStdout: true, ShowStderr: true, Follow: true, Timestamps: false})
	if err != nil {
		return err
	}
	defer reader.Close()

	_, err = io.Copy(os.Stdout, reader)
	if err != nil && err != io.EOF {
		return err
	}
	return nil
}

func (d *DockerClient) FetchAnalysisResults() ([]byte, string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*120)
	defer cancel()

	// If no error is found from the above step, copy the analysis results file to the host
	contentReader, _, err := d.Client.CopyFromContainer(ctx, d.ContainerID, path.Join(d.AnalysisOpts.ContainerToolBoxPath, d.AnalysisOpts.AnalysisResultsFilename))
	if err != nil {
		return nil, "", err
	}
	defer contentReader.Close()

	tr := tar.NewReader(contentReader)

	// Read the TAR archive returned by docker
	result, err := tr.Next()
	if err != nil {
		if err != io.EOF {
			return nil, "", err
		}
	}

	// Read the contents of the TAR archive into a byte buffer
	buf, err := ioutil.ReadAll(tr)
	if err != nil {
		return nil, "", err
	}
	return buf, result.Name, nil
}