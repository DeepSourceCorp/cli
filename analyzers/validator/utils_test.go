package validator

import (
	"os"
	"strings"
	"testing"

	"github.com/google/go-cmp/cmp"
)

func TestParseTOMLErrorCodeFrame(t *testing.T) {
	type test struct {
		description   string
		codeframePath string
		want          []string
	}

	tests := []test{
		{
			description:   "empty codeframe",
			codeframePath: "./testdata/codeframe/codeframe_empty.txt",
			want:          []string{""},
		},
		{
			description:   "codeframe with field",
			codeframePath: "./testdata/codeframe/codeframe.txt",
			want:          []string{"key2"},
		},
		{
			description:   "codeframe with mixed formats",
			codeframePath: "./testdata/codeframe/codeframe_mixed.txt",
			want:          []string{""},
		},
		{
			description:   "codeframe with spaces",
			codeframePath: "./testdata/codeframe/codeframe_spaces.txt",
			want:          []string{"key2"},
		},
	}

	for _, tc := range tests {
		fileContent, err := os.ReadFile(tc.codeframePath)
		if err != nil {
			t.Errorf("error raised while running test (%s): %s\n", tc.description, err)
		}

		// Convert file content to string.
		codeframe := string(fileContent)
		codeframe = strings.TrimSpace(codeframe)

		got := parseTOMLErrorCodeFrame(codeframe)

		diff := cmp.Diff(got, tc.want)
		if len(diff) != 0 {
			t.Errorf("test failed (%s)\ngot != want:\n%s\n", tc.description, diff)
		}
	}
}
