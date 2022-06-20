package dryrun

import (
	"bytes"
	"encoding/json"
	"os"
	"strings"
	"testing"

	"github.com/deepsourcelabs/cli/analyzers/backend/docker"
	"github.com/deepsourcelabs/cli/utils"
)

func TestPrepareAnalysisConfig(t *testing.T) {
	type TestCase struct {
		CodePath     string
		ToolBoxPath  string
		AnalyzerName string
	}

	testCases := []TestCase{
		{
			CodePath:     "testdata/project1/",
			ToolBoxPath:  "testdata/toolbox/project1/",
			AnalyzerName: "acme",
		},
		{
			CodePath:     "testdata/project2/",
			ToolBoxPath:  "testdata/toolbox/project2/",
			AnalyzerName: "vim",
		},
		{
			CodePath:     "testdata/project3/",
			ToolBoxPath:  "testdata/toolbox/project3/",
			AnalyzerName: "emacs",
		},
		{
			CodePath:     "testdata/project4/",
			ToolBoxPath:  "testdata/toolbox/project4/",
			AnalyzerName: "nano",
		},
	}
	containerCodePath := "/code"

	for _, tc := range testCases {
		dc := docker.DockerClient{
			AnalysisOpts: docker.AnalysisParams{
				AnalyzerName:      tc.AnalyzerName,
				HostCodePath:      tc.CodePath,
				ContainerCodePath: containerCodePath,
			},
		}

		opts := AnalyzerDryRun{
			Client:               &dc,
			TempToolBoxDirectory: tc.ToolBoxPath,
		}

		err := opts.prepareAnalysisConfig()
		if err != nil {
			t.Errorf("Failed to verify analysis config generation. Error:%s", err)
		}
		modifyAnalysisConfigFilepaths(opts.AnalysisConfig, opts.Client.AnalysisOpts.HostCodePath, opts.Client.AnalysisOpts.ContainerCodePath)

		receivedAnalysisConfig, err := json.Marshal(opts.AnalysisConfig)
		if err != nil {
			t.Errorf("Failed to marshal the received config to JSON. Error:%s", err)
		}

		expectedAnalysisConfig, err := os.ReadFile(tc.ToolBoxPath + "analysis_config.json")
		if err != nil {
			t.Errorf("Failed to read the expected analysis config. Error:%s", err)
		}

		if !bytes.Equal(receivedAnalysisConfig, expectedAnalysisConfig) {
			t.Errorf("Received invalid analysis config. Expected %s\nGot %s\n", string(expectedAnalysisConfig), string(receivedAnalysisConfig))
		}

	}
}

func TestResolveAnalysisCodePath(t *testing.T) {
	type TestCase struct {
		Path         string
		Response     string
		RemoteSource bool
	}

	testCases := []TestCase{
		{
			Path:         "/Users/phoenix/codes/",
			Response:     "/Users/phoenix/codes",
			RemoteSource: false,
		},
		{
			Path:         "/tmp/helloworld/",
			Response:     "/tmp/helloworld",
			RemoteSource: false,
		},
		{
			Path:         "https://github.com/deepsourcelabs/shifty",
			Response:     "TEMPDIR",
			RemoteSource: true,
		},
		{
			Path:         "https://gitlab.com/deepsourcelabs/demo-go",
			Response:     "TEMPDIR",
			RemoteSource: true,
		},
		{
			Path:         "github.com/deepsourcelabs/cli",
			Response:     "TEMPDIR",
			RemoteSource: false,
		},
	}

	for _, tc := range testCases {
		opts := AnalyzerDryRun{
			SourcePath: tc.Path,
			Spinner:    &utils.SpinnerUtils{},
		}
		resolvedPath, err := opts.resolveAnalysisCodePath()
		if err != nil && err.Error() != "authentication required" {
			t.Errorf("Failed to resolve the analysis source path. Error:%s", err)
		}

		if opts.RemoteSource != tc.RemoteSource {
			t.Errorf("Expected RemoteSource for %s to be %v. Got %v", tc.Path, tc.RemoteSource, opts.RemoteSource)
		}
		if resolvedPath != tc.Response {
			if tc.Response != "TEMPDIR" {
				t.Errorf("Failed to resolve the local analysis source path. Wanted %s. Got %s", tc.Response, resolvedPath)
			}

			if !strings.HasPrefix(resolvedPath, os.Getenv("TEMPDIR")) {
				t.Errorf("Failed to resolve the remote analysis source path. Wanted a temp directory. Got %s", resolvedPath)
			}
		}
	}
}
