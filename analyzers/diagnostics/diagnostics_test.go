package diagnostics

import (
	"os"
	"regexp"
	"strings"
	"testing"

	"github.com/deepsourcelabs/cli/analyzers/validator"
	"github.com/google/go-cmp/cmp"
)

func TestPrepareCodeFrame(t *testing.T) {
	type test struct {
		description   string
		lineNum       int // lineNum always starts from 0.
		linesFilename string
		wantFilename  string
	}

	tests := []test{
		{
			description:   "single line",
			lineNum:       1,
			linesFilename: "./testdata/test_codeframe/single_line/test.toml",
			wantFilename:  "./testdata/test_codeframe/single_line/test_want.toml",
		},
		{
			description:   "multiple lines",
			lineNum:       2,
			linesFilename: "./testdata/test_codeframe/multiple_lines/test.toml",
			wantFilename:  "./testdata/test_codeframe/multiple_lines/test_want.toml",
		},
		{
			description:   "multiple lines at bottom",
			lineNum:       5,
			linesFilename: "./testdata/test_codeframe/multiple_lines_bottom/test.toml",
			wantFilename:  "./testdata/test_codeframe/multiple_lines_bottom/test_want.toml",
		},
	}

	for _, tc := range tests {
		t.Run(tc.description, func(t *testing.T) {
			// Read file for getting line content.
			fileContentLines, err := os.ReadFile(tc.linesFilename)
			if err != nil {
				t.Errorf("error raised while running test (%s): %s\n", tc.description, err)
			}
			linesStr := string(fileContentLines)
			lines := strings.Split(linesStr, "\n")

			// Prepare code frame.
			got := prepareCodeFrame(tc.lineNum, lines)

			// Strip ANSI escape codes.
			got = stripANSI(got)
			got = strings.TrimSpace(got)

			fileContent, err := os.ReadFile(tc.wantFilename)
			if err != nil {
				t.Errorf("error raised while running test (%s): %s\n", tc.description, err)
			}

			// Convert file content to string.
			want := string(fileContent)
			want = strings.TrimSpace(want)

			diff := cmp.Diff(got, want)
			if len(diff) != 0 {
				t.Errorf("test failed (%s)\ngot != want:\n%s\n", tc.description, diff)
			}
		})
	}
}

func TestGetDiagnostics(t *testing.T) {
	type test struct {
		description  string
		failure      validator.ValidationFailure
		wantFilename string
	}

	tests := []test{
		{
			description: "single error",
			failure: validator.ValidationFailure{
				File: "./testdata/test_getdiagnostics/single_error/test.toml",
				Errors: []validator.ErrorMeta{
					{
						Field:   "engine",
						Message: "Invalid build engine \"docke\". The following build engines are supported: [docker]",
					},
				},
			},
			wantFilename: "./testdata/test_getdiagnostics/single_error/test_want.toml",
		},
		{
			description: "multiple errors",
			failure: validator.ValidationFailure{
				File: "./testdata/test_getdiagnostics/multiple_errors/test.toml",
				Errors: []validator.ErrorMeta{
					{
						Field:   "shortcode",
						Message: "Analyzer shortcode should begin with '@'",
					},
					{
						Field:   "engine",
						Message: "Invalid build engine \"docke\". The following build engines are supported: [docker]",
					},
				},
			},
			wantFilename: "./testdata/test_getdiagnostics/multiple_errors/test_want.toml",
		},
		{
			description: "no errors",
			failure: validator.ValidationFailure{
				File:   "./testdata/test_getdiagnostics/no_errors/test.toml",
				Errors: []validator.ErrorMeta{},
			},
			wantFilename: "./testdata/test_getdiagnostics/no_errors/test_want.toml",
		},
		{
			description: "file with less lines",
			failure: validator.ValidationFailure{
				File: "./testdata/test_getdiagnostics/less_lines/test.toml",
				Errors: []validator.ErrorMeta{
					{
						Field:   "shortcode",
						Message: "Analyzer shortcode should begin with '@'",
					},
				},
			},
			wantFilename: "./testdata/test_getdiagnostics/less_lines/test_want.toml",
		},
	}

	for _, tc := range tests {
		t.Run(tc.description, func(t *testing.T) {
			got, err := GetDiagnostics(tc.failure)
			if err != nil {
				t.Errorf("error raised while running test (%s): %s\n", tc.description, err)
			}

			// Prepare a string for comparing.
			gotStr := ""
			for _, str := range got {
				gotStr += str + "\n"
			}
			gotStr = strings.TrimSpace(gotStr)

			fileContent, err := os.ReadFile(tc.wantFilename)
			if err != nil {
				t.Errorf("error raised while running test (%s): %s\n", tc.description, err)
			}

			// Convert file content to string.
			want := string(fileContent)
			want = strings.TrimSpace(want)

			// Strip ANSI escape codes.
			gotStr = stripANSI(gotStr)

			diff := cmp.Diff(gotStr, want)
			if len(diff) != 0 {
				t.Errorf("test failed (%s)\ngot != want:\n%s\n", tc.description, diff)
			}
		})
	}
}

// Strip ANSI codes for testing.
func stripANSI(str string) string {
	ansi := "[\u001B\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[a-zA-Z\\d]*)*)?\u0007)|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))"
	re := regexp.MustCompile(ansi)
	return re.ReplaceAllString(str, "")
}
