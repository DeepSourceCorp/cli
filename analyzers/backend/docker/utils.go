package docker

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"strings"
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

type DockerPullResponse struct {
	Status   string `json:"status"`
	Progress string `json:"progress"`
	ID       string `json:"id"`
}

/* Checks the docker build response and prints all the logs if `showAllLogs` is true
 * Used in `deepsource analyzer run` and `deepsource analyzer verify` commands */
func CheckResponse(rd io.Reader, showAllLogs bool) error { // skipcq: RVV-A0005
	var lastLine []byte
	count := 0
	var currentStream string

	scanner := bufio.NewScanner(rd)
	for scanner.Scan() {
		lastLine = scanner.Bytes()
		d := &DockerBuildResponse{}
		err := json.Unmarshal(lastLine, d)
		if err != nil {
			return err
		}
		if d.Stream == "" || d.Stream == "\n" || strings.Contains(d.Stream, "--->") || strings.TrimSuffix(d.Stream, "\n") == currentStream {
			continue
		}
		currentStream = strings.TrimSuffix(d.Stream, "\n")
		if showAllLogs {
			fmt.Println(currentStream)
		}
		count++
	}

	errLine := &ErrorLine{}
	json.Unmarshal([]byte(lastLine), errLine)
	if errLine.Error != "" {
		return errors.New(errLine.Error)
	}
	return scanner.Err()
}

/* Checks the docker pull response and prints all the logs if `showAllLogs` is true
 * Used in `deepsource analyzer dry-run` command. */
func CheckPullResponse(rd io.Reader, showAllLogs bool) error { // skipcq: RVV-A0005
	var lastLine []byte
	count := 0

	scanner := bufio.NewScanner(rd)
	for scanner.Scan() {
		lastLine = scanner.Bytes()
		d := &DockerPullResponse{}
		err := json.Unmarshal(lastLine, d)
		if err != nil {
			return err
		}
		if showAllLogs {
			fmt.Printf("%s %s\n", d.Status, d.Progress)
		}
		count++
	}

	errLine := &ErrorLine{}
	json.Unmarshal([]byte(lastLine), errLine)
	if errLine.Error != "" {
		return errors.New(errLine.Error)
	}
	return scanner.Err()
}
