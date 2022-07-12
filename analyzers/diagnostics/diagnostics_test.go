package diagnostics

import (
	"os"
	"strings"
	"testing"

	"github.com/deepsourcelabs/cli/analyzers/validator"
	"github.com/google/go-cmp/cmp"
)

func TestPrepareCodeFrame(t *testing.T) {
	type test struct {
		description string
		lineNum     int // lineNum always starts from 0.
		lines       []string
		want        string
	}

	tests := []test{
		{
			description: "single line",
			lineNum:     1,
			lines: []string{
				`name = ""`,
				`shortcode = "@aadhav-deepsource/2do-checker"`,
				`example = "hello"`,
			},
			want: "> 2 | shortcode = \"@aadhav-deepsource/2do-checker\"\n  3 | example = \"hello\"\n",
		},
		{
			description: "multiple lines",
			lineNum:     2,
			lines: []string{
				``,
				`[build]`,
				`engine = "docke"`,
				`dockerfile = ""`,
				``,
				`[test]`,
				`command = ""`,
			},
			want: "  2 | [build]\n> 3 | engine = \"docke\"\n  4 | dockerfile = \"\"\n",
		},
		{
			description: "multiple lines at bottom",
			lineNum:     5,
			lines: []string{
				``,
				`[build]`,
				`engine = "docke"`,
				`dockerfile = ""`,
				`error = ""`,
				``,
			},
			want: "> 5 | error = \"\"\n",
		},
	}

	for _, tc := range tests {
		t.Run(tc.description, func(t *testing.T) {
			got := prepareCodeFrame(tc.lineNum, tc.lines)

			diff := cmp.Diff(got, tc.want)
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
				File: "./testdata/single_error/test.toml",
				Errors: []validator.ErrorMeta{
					{
						Field:   "engine",
						Message: "Invalid build engine \"docke\". The following build engines are supported: [docker]",
					},
				},
			},
			wantFilename: "./testdata/single_error/test_want.toml",
		},
		{
			description: "multiple errors",
			failure: validator.ValidationFailure{
				File: "./testdata/multiple_errors/test.toml",
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
			wantFilename: "./testdata/multiple_errors/test_want.toml",
		},
		{
			description: "no errors",
			failure: validator.ValidationFailure{
				File:   "./testdata/no_errors/test.toml",
				Errors: []validator.ErrorMeta{},
			},
			wantFilename: "./testdata/no_errors/test_want.toml",
		},
		{
			description: "invalid file (file with less lines)",
			failure: validator.ValidationFailure{
				File:   "./testdata/invalid_file/test.toml",
				Errors: []validator.ErrorMeta{},
			},
			wantFilename: "./testdata/invalid_file/test_want.toml",
		},
	}

	for _, tc := range tests {
		t.Run(tc.description, func(t *testing.T) {
			got, err := GetDiagnostics(tc.failure)
			if err != nil {
				t.Errorf("error raised while running test (%s): %s\n", tc.description, err)
			}

			newGot := ""
			for _, str := range got {
				newGot += str
				newGot += "\n"
			}
			newGot = strings.TrimSpace(newGot)

			fileContent, err := os.ReadFile(tc.wantFilename)
			if err != nil {
				t.Errorf("error raised while running test (%s): %s\n", tc.description, err)
			}

			want := string(fileContent)
			want = strings.TrimSpace(want)

			diff := cmp.Diff(newGot, want)
			if len(diff) != 0 {
				t.Errorf("test failed (%s)\ngot != want:\n%s\n", tc.description, diff)
			}
		})
	}
}
