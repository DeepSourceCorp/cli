package list

import (
	"io/ioutil"
	"os"
	"reflect"
	"strings"
	"testing"

	"github.com/deepsourcelabs/cli/deepsource/issues"
)

var issues_data []issues.Issue
var issues_data_multi []issues.Issue

func init() {
	issues_data = []issues.Issue{
		{
			Analyzer: issues.AnalyzerMeta{
				Shortcode: "go",
			},
			IssueCode: "RVV-B0013",
			IssueText: "Unused method receiver detected",
			Location: issues.Location{
				Path: "deepsource/transformers/queries/get_transformers.go",
				Position: issues.Position{
					BeginLine: 34,
					EndLine:   34,
				},
			},
		},
		{
			Analyzer: issues.AnalyzerMeta{
				Shortcode: "go",
			},
			IssueCode: "RVV-B0013",
			IssueText: "Unused method receiver detected",
			Location: issues.Location{
				Path: "deepsource/transformers/queries/get_transformers.go",
				Position: issues.Position{
					BeginLine: 44,
					EndLine:   44,
				},
			},
		},
	}

	issues_data_multi = []issues.Issue{
		{
			Analyzer: issues.AnalyzerMeta{
				Shortcode: "go",
			},
			IssueCode: "RVV-B0013",
			IssueText: "Unused method receiver detected",
			Location: issues.Location{
				Path: "deepsource/transformers/queries/get_transformers.go",
				Position: issues.Position{
					BeginLine: 34,
					EndLine:   34,
				},
			},
		},
		{
			Analyzer: issues.AnalyzerMeta{
				Shortcode: "go",
			},
			IssueCode: "RVV-B0013",
			IssueText: "Unused method receiver detected",
			Location: issues.Location{
				Path: "deepsource/transformers/queries/get_transformers.go",
				Position: issues.Position{
					BeginLine: 44,
					EndLine:   44,
				},
			},
		},
		{
			Analyzer: issues.AnalyzerMeta{
				Shortcode: "docker",
			},
			IssueCode: "DOK-DL3025",
			IssueText: "Use arguments JSON notation for CMD and ENTRYPOINT arguments",
			Location: issues.Location{
				Path: "Dockerfile",
				Position: issues.Position{
					BeginLine: 64,
					EndLine:   64,
				},
			},
		},
	}
}

func TestListCSV(t *testing.T) {
	want := [][]string{{"analyzer", "issue_code", "issue_title", "occurence_title", "issue_category", "path", "begin_line", "begin_column", "end_line", "end_column"}, {"go", "RVV-B0013", "Unused method receiver detected", "Unused method receiver detected", "", "deepsource/transformers/queries/get_transformers.go", "34", "0", "34", "0"}, {"go", "RVV-B0013", "Unused method receiver detected", "Unused method receiver detected", "", "deepsource/transformers/queries/get_transformers.go", "44", "0", "44", "0"}}

	got := convertCSV(issues_data)

	if !reflect.DeepEqual(got, want) {
		t.Errorf("got: %s; want: %s\n", got, want)
	}
}

func TestListJSON(t *testing.T) {

	occurences := []IssueJSON{
		{
			Analyzer:       "go",
			IssueCode:      "RVV-B0013",
			IssueTitle:     "Unused method receiver detected",
			OccurenceTitle: "Unused method receiver detected",
			IssueCategory:  "",
			Location: LocationJSON{
				Path: "deepsource/transformers/queries/get_transformers.go",
				Position: PositionJSON{
					Begin: LineColumn{
						Line:   34,
						Column: 0,
					},
					End: LineColumn{
						Line:   34,
						Column: 0,
					},
				},
			},
		},
		{
			Analyzer:       "go",
			IssueCode:      "RVV-B0013",
			IssueTitle:     "Unused method receiver detected",
			OccurenceTitle: "Unused method receiver detected",
			IssueCategory:  "",
			Location: LocationJSON{
				Path: "deepsource/transformers/queries/get_transformers.go",
				Position: PositionJSON{
					Begin: LineColumn{
						Line:   44,
						Column: 0,
					},
					End: LineColumn{
						Line:   44,
						Column: 0,
					},
				},
			},
		},
	}

	summary := Summary{
		TotalOccurences: 2,
		UniqueIssues:    1,
	}

	want := ExportData{
		Occurences: occurences,
		Summary:    summary,
	}

	issues := []issues.Issue{
		{
			Analyzer: issues.AnalyzerMeta{
				Shortcode: "go",
			},
			IssueCode: "RVV-B0013",
			IssueText: "Unused method receiver detected",
			Location: issues.Location{
				Path: "deepsource/transformers/queries/get_transformers.go",
				Position: issues.Position{
					BeginLine: 34,
					EndLine:   34,
				},
			},
		},
		{
			Analyzer: issues.AnalyzerMeta{
				Shortcode: "go",
			},
			IssueCode: "RVV-B0013",
			IssueText: "Unused method receiver detected",
			Location: issues.Location{
				Path: "deepsource/transformers/queries/get_transformers.go",
				Position: issues.Position{
					BeginLine: 44,
					EndLine:   44,
				},
			},
		},
	}

	got := convertJSON(issues)

	if !reflect.DeepEqual(got, want) {
		t.Errorf("got: %v; want: %v\n", got, want)
	}
}

func TestListSARIF(t *testing.T) {

	t.Run("must work with single language repositories", func(t *testing.T) {
		// export issues to SARIF
		opts := IssuesListOptions{issuesData: issues_data}
		opts.exportSARIF("./testdata/exported.sarif")

		// read exported and test SARIF files
		exported, _ := ioutil.ReadFile("./testdata/exported.sarif")
		test, _ := ioutil.ReadFile("./testdata/test.sarif")

		// trim carriage returns
		got := strings.TrimSuffix(string(exported), "\n")
		want := strings.TrimSuffix(string(test), "\n")

		// cleanup after test
		_ = os.Remove("./testdata/exported.sarif")

		if !reflect.DeepEqual(got, want) {
			t.Errorf("got: %v; want: %v\n", got, want)
		}
	})

	t.Run("must work with repositories containing multiple languages", func(t *testing.T) {
		// export issues to SARIF
		opts := IssuesListOptions{issuesData: issues_data_multi}
		opts.exportSARIF("./testdata/exported_multi.sarif")

		// read exported and test SARIF files
		exported, _ := ioutil.ReadFile("./testdata/exported_multi.sarif")
		test, _ := ioutil.ReadFile("./testdata/test_multi.sarif")

		// trim carriage returns
		got := strings.TrimSuffix(string(exported), "\n")
		want := strings.TrimSuffix(string(test), "\n")

		// cleanup after test
		_ = os.Remove("./testdata/exported_multi.sarif")

		if !reflect.DeepEqual(got, want) {
			t.Errorf("got: %v; want: %v\n", got, want)
		}
	})
}
