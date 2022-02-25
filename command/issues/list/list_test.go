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
