package list

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"reflect"
	"strings"
	"testing"

	"github.com/deepsourcelabs/cli/deepsource/issues"
)

// Helper function to read issues from a file.
func ReadIssues(path string) []issues.Issue {
	raw, _ := ioutil.ReadFile(path)
	var fetchedIssues []issues.Issue
	_ = json.Unmarshal(raw, &fetchedIssues)

	return fetchedIssues
}

func TestListCSV(t *testing.T) {
	issues_data := ReadIssues("./testdata/dummy/issues.json")
	opts := IssuesListOptions{issuesData: issues_data}
	opts.exportCSV("./testdata/exported.csv")

	// read exported and test CSV files
	exported, _ := ioutil.ReadFile("./testdata/exported.csv")
	test, _ := ioutil.ReadFile("./testdata/csv/test.csv")

	// trim carriage returns
	got := strings.TrimSuffix(string(exported), "\n")
	want := strings.TrimSuffix(string(test), "\n")

	// cleanup after test
	_ = os.Remove("./testdata/exported.csv")

	if !reflect.DeepEqual(got, want) {
		t.Errorf("got: %v; want: %v\n", got, want)
	}
}

func TestListJSON(t *testing.T) {
	issues_data := ReadIssues("./testdata/dummy/issues.json")
	opts := IssuesListOptions{issuesData: issues_data}
	opts.exportJSON("./testdata/exported.json")

	// read exported and test JSON files
	exported, _ := ioutil.ReadFile("./testdata/exported.json")
	test, _ := ioutil.ReadFile("./testdata/json/test.json")

	// trim carriage returns
	got := strings.TrimSuffix(string(exported), "\n")
	want := strings.TrimSuffix(string(test), "\n")

	// cleanup after test
	_ = os.Remove("./testdata/exported.json")

	if !reflect.DeepEqual(got, want) {
		t.Errorf("got: %v; want: %v\n", got, want)
	}
}

func TestListSARIF(t *testing.T) {
	t.Run("must work with single language repositories", func(t *testing.T) {
		// export issues to SARIF
		issues_data := ReadIssues("./testdata/dummy/issues.json")

		opts := IssuesListOptions{issuesData: issues_data}
		opts.exportSARIF("./testdata/exported.sarif")

		// read exported and test SARIF files
		exported, _ := ioutil.ReadFile("./testdata/exported.sarif")
		test, _ := ioutil.ReadFile("./testdata/sarif/test.sarif")

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
		issues_data := ReadIssues("./testdata/dummy/issues_data_multi.json")

		opts := IssuesListOptions{issuesData: issues_data}
		opts.exportSARIF("./testdata/exported_multi.sarif")

		// read exported and test SARIF files
		exported, _ := ioutil.ReadFile("./testdata/exported_multi.sarif")
		test, _ := ioutil.ReadFile("./testdata/sarif/test_multi.sarif")

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

func TestFilterIssuesByPath(t *testing.T) {
	t.Run("must work with files", func(t *testing.T) {
		issues_data := ReadIssues("./testdata/dummy/issues_data_multi.json")
		issues_docker := ReadIssues("./testdata/dummy/issues_docker.json")

		got, _ := filterIssuesByPath("Dockerfile", issues_data)
		want := issues_docker
		if !reflect.DeepEqual(got, want) {
			t.Errorf("got: %v; want: %v\n", got, want)
		}
	})

	t.Run("must work with directories", func(t *testing.T) {
		issues_data := ReadIssues("./testdata/dummy/issues_data_multi.json")
		issues_deepsource := ReadIssues("./testdata/dummy/issues_deepsource.json")

		got, _ := filterIssuesByPath("deepsource/", issues_data)
		want := issues_deepsource
		if !reflect.DeepEqual(got, want) {
			t.Errorf("got: %v; want: %v\n", got, want)
		}
	})
}

func TestFilterIssuesByAnalyzer(t *testing.T) {
	t.Run("must work with a single analyzer", func(t *testing.T) {
		issues_data := ReadIssues("./testdata/dummy/issues_data_multi.json")
		issues_docker := ReadIssues("./testdata/dummy/issues_docker.json")

		got, _ := filterIssuesByAnalyzer([]string{"docker"}, issues_data)
		want := issues_docker
		if !reflect.DeepEqual(got, want) {
			t.Errorf("got: %v; want: %v\n", got, want)
		}
	})

	t.Run("must work with multiple analyzers", func(t *testing.T) {
		issues_data := ReadIssues("./testdata/dummy/issues_data_multi.json")
		issues_multi_analyzers := ReadIssues("./testdata/dummy/issues_multiple_analyzers.json")

		got, _ := filterIssuesByAnalyzer([]string{"docker", "python"}, issues_data)
		want := issues_multi_analyzers
		if !reflect.DeepEqual(got, want) {
			t.Errorf("got: %v; want: %v\n", got, want)
		}
	})
}

func TestFilterIssuesBySeverity(t *testing.T) {
	// Path to the dedicated severity test data
	testDataPath := "./testdata/dummy/issues_severity.json"

	// Case 1: Filter by a single severity
	t.Run("must work with a single severity", func(t *testing.T) {
		issues_data := ReadIssues(testDataPath)
		// Testing lowercase "critical" to verify the ToUpper normalization logic
		got, err := filterIssuesBySeverity([]string{"critical"}, issues_data)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		// Expecting only the one CRITICAL issue defined in our JSON
		if len(got) != 1 || strings.ToUpper(got[0].IssueSeverity) != "CRITICAL" {
			t.Errorf("got: %v; expected 1 CRITICAL issue", got)
		}
	})

	// Case 2: Filter by multiple severities simultaneously (Logical OR)
	t.Run("must work with multiple severities", func(t *testing.T) {
		issues_data := ReadIssues(testDataPath)

		// Should return both MAJOR and MINOR issues
		got, err := filterIssuesBySeverity([]string{"MAJOR", "MINOR"}, issues_data)

		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if len(got) != 2 {
			t.Errorf("got: %d issues; want 2", len(got))
		}
	})

	// Case 3: Handle invalid severity strings
	t.Run("must return error for invalid severity input", func(t *testing.T) {
		issues_data := ReadIssues(testDataPath)

		// Verifying that the validator catches illegal entries
		_, err := filterIssuesBySeverity([]string{"invalid_level"}, issues_data)
		if err == nil {
			t.Error("expected error for invalid severity 'invalid_level', got nil")
		}
	})

	// Case 4: Handle valid severity that has no matches in the data
	t.Run("must return empty list when no matches exist", func(t *testing.T) {
		// Create a subset with only MINOR issues
		subset := []issues.Issue{{IssueSeverity: "MINOR"}}

		// Filtering for CRITICAL should yield 0 results but NO error
		got, err := filterIssuesBySeverity([]string{"CRITICAL"}, subset)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if len(got) != 0 {
			t.Errorf("expected 0 issues, got %d", len(got))
		}
	})

	t.Run("should handle duplicate severity flags gracefully", func(t *testing.T) {
		issues_data := ReadIssues(testDataPath)

		got, _ := filterIssuesBySeverity([]string{"critical", "critical"}, issues_data)
		if len(got) != 1 {
			t.Errorf("expected 1 issue despite duplicate flag, got %d", len(got))
		}
	})
}
