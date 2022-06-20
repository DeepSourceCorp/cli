package dryrun

import (
	"bytes"
	"os"
	"os/exec"
	"path"
	"testing"

	"github.com/google/go-cmp/cmp"
)

// Execute the command from there
func TestAnalyzerRun(t *testing.T) {
	/* =============================================================================
	// Copying the todo-checker directory to $APP_PATH for the integration tests
	/* ============================================================================= */
	cwd, _ := os.Getwd()

	analyzerPath := path.Join(cwd, "todo-checker")
	appPath := os.Getenv("APP_PATH")
	if appPath == "" {
		appPath = "/app/"
	}

	// Copy all the files to APP_PATH
	cmd := exec.Command("cp", "-a", analyzerPath+"/.", ".")
	cmd.Dir = appPath

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	// Run the command
	err := cmd.Run()
	outStr, outErr := stdout.String(), stderr.String()
	if err != nil {
		t.Errorf("Failed to copy the analyzer code to %s. Error:%s\n%s", appPath, err, outErr)
	}
	t.Log(outStr)

	/* =============================================================================
	 * Run the analyzer dry-run command on the testdata/todo-checker directory
	 * ============================================================================= */

	analysisCmd := exec.Command("/tmp/deepsource", "analyzer", "dry-run", analyzerPath, "--output-file", appPath)
	analysisCmd.Dir = appPath

	var stdout1, stderr1 bytes.Buffer
	analysisErr := analysisCmd.Run()
	outStr1, outErr1 := stdout1.String(), stderr1.String()
	if err != nil {
		t.Errorf("Failed to run the analyzer. Error:%s\n%s", analysisErr, outErr1)
	}
	t.Log(outStr1)

	/* =============================================================================
	// Compare the results
	/* ============================================================================= */

	receivedAnalysisResults, err := os.ReadFile(path.Join(appPath, "analysis_results.json"))
	if err != nil {
		t.Errorf("Failed to read the received analysis result. Error:%s", err)
	}
	expectedAnalysisResults, err := os.ReadFile(path.Join(cwd, "expected_analysis_results.json"))
	if err != nil {
		t.Errorf("Failed to read the expected analysis result. Error:%s", err)
	}
	if !bytes.Equal(receivedAnalysisResults, expectedAnalysisResults) {
		diff := cmp.Diff(receivedAnalysisResults, expectedAnalysisResults)
		t.Errorf("Failed to verify analysis results. Expected: %s\n==========\nGot: %s\n=========\nDiff:%s", expectedAnalysisResults, receivedAnalysisResults, diff)
	}
}
