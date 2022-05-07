package build

import (
	"bufio"
	"context"
	"encoding/json"
	"errors"
	"io"
	"log"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/archive"
)

type ErrorLine struct {
	Error       string      `json:"error"`
	ErrorDetail ErrorDetail `json:"errorDetail"`
}

type ErrorDetail struct {
	Message string `json:"message"`
}

type DockerBuildResponse struct {
	Stream string `json:"stream"`
}

type DockerClient struct {
	Client         *client.Client
	ImageName      string
	ImageTag       string
	DockerfilePath string
}

type DockerBuildError struct {
	Message string
}

func (d *DockerBuildError) Error() string {
	return d.Message
}

var (
	m  sync.Mutex
	wg sync.WaitGroup
)

func (d *DockerClient) BuildAnalyzerDockerImage() *DockerBuildError {
	var err error
	d.Client, err = client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		return &DockerBuildError{
			Message: err.Error(),
		}
	}

	if err = d.executeImageBuild(); err != nil {
		return &DockerBuildError{
			Message: err.Error(),
		}
	}
	return nil
}

func (d *DockerClient) executeImageBuild() error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*120)
	defer cancel()
	cwd, _ := os.Getwd()

	tarOptions := &archive.TarOptions{
		ExcludePatterns: []string{".git/**"},
	}

	tar, err := archive.TarWithOptions(cwd, tarOptions)
	if err != nil {
		return err
	}

	opts := types.ImageBuildOptions{
		Dockerfile: "Dockerfile",
		Tags:       []string{d.ImageName},
		Remove:     true,
	}
	res, err := d.Client.ImageBuild(ctx, tar, opts)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	err = checkResponse(res.Body)
	if err != nil {
		return err
	}
	return nil
}

func checkResponse(rd io.Reader) error {
	var lastLine []byte
	count := 0
	var currentStream string

	scanner := bufio.NewScanner(rd)
	for scanner.Scan() {
		lastLine = scanner.Bytes()
		d := &DockerBuildResponse{}
		err := json.Unmarshal(lastLine, d)
		if err != nil {
			log.Println(err)
		}

		if d.Stream == "" || d.Stream == "\n" || strings.TrimSuffix(d.Stream, "\n") == currentStream {
			continue
		}

		currentStream = strings.TrimSuffix(d.Stream, "\n")
		count++
	}

	errLine := &ErrorLine{}
	json.Unmarshal([]byte(lastLine), errLine)
	if errLine.Error != "" {
		return errors.New(errLine.Error)
	}

	if err := scanner.Err(); err != nil {
		return err
	}

	return nil
}
