package build

import (
	"bufio"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/briandowns/spinner"
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/archive"
)

var dockerRegistryUserID = ""

type DockerBuildResponse struct {
	Stream string `json:"stream"`
	// ProgressDetail struct {
	//     Current int `json:"current"`
	//     Total   int `json:"total"`
	// } `json:"progressDetail"`
	// Progress string `json:"progress"`
	// ID       string `json:"id"`
}

type ErrorLine struct {
	Error       string      `json:"error"`
	ErrorDetail ErrorDetail `json:"errorDetail"`
}

type ErrorDetail struct {
	Message string `json:"message"`
}

type DockerBuildParams struct {
	ImageName string
}

func (d DockerBuildParams) BuildMacroDockerImage() error {
	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		log.Println(err.Error())
		return err
	}

	err = d.imageBuild(cli)
	if err != nil {
		log.Println(err.Error())
		return err
	}
	return nil
}

func (d DockerBuildParams) imageBuild(dockerClient *client.Client) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*120)
	defer cancel()
	cwd, _ := os.Getwd()

	tar, err := archive.TarWithOptions(cwd, &archive.TarOptions{})
	if err != nil {
		return err
	}

	opts := types.ImageBuildOptions{
		Dockerfile: "Dockerfile",
		Tags:       []string{d.ImageName},
		Remove:     true,
	}
	res, err := dockerClient.ImageBuild(ctx, tar, opts)
	if err != nil {
		return err
	}

	defer res.Body.Close()

	err = print(res.Body)
	if err != nil {
		return err
	}

	return nil
}

var (
	m  sync.Mutex
	wg sync.WaitGroup
	s  = spinner.New(spinner.CharSets[11], 100*time.Millisecond)
)

func print(rd io.Reader) error {
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

		if count > 1 {
			s.Stop()
			s = nil
			s = spinner.New(spinner.CharSets[11], 100*time.Millisecond)
		}

		s.Suffix = fmt.Sprintf(" %s...", strings.TrimSuffix(d.Stream, "\n"))
		s.FinalMSG = fmt.Sprintf(" %s...Succeeded", strings.TrimSuffix(d.Stream, "\n"))
		s.Start() // Start the spinner
	}

	s.Stop()
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
