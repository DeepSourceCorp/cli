package run

import (
	"os"
	"strings"
	"testing"
)

func TestResolveAnalysisCodePath(t *testing.T) {
	type TestCase struct {
		Path         string
		Response     string
		RemoteSource bool
	}

	testCases := []TestCase{
		{
			Path:         "/Users/phoenix/codes/",
			Response:     "/Users/phoenix/codes/",
			RemoteSource: false,
		},
		{
			Path:         "/tmp/helloworld/",
			Response:     "/tmp/helloworld/",
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
		opts := AnalyzerRunOpts{
			SourcePath: tc.Path,
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
