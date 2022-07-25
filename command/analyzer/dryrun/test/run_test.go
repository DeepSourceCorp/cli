package dryrun

import (
	"bytes"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path"
	"testing"

	"github.com/fsnotify/fsnotify"
	"github.com/google/go-cmp/cmp"
)

// Execute the command from there
func TestAnalyzerRun(t *testing.T) {
	var analysisCmd *exec.Cmd
	/* =============================================================================
	// Copying the todo-checker directory to $APP_PATH for the integration tests
	/* ============================================================================= */
	log.Println("Testing dry-run command")
	cwd, _ := os.Getwd()

	analyzerPath := path.Join(cwd, "todo-checker")
	appPath := os.Getenv("APP_PATH")
	if appPath == "" {
		appPath = "/app/"
	}

	// Copy all the files to APP_PATH.
	log.Println("Copying the todo-checker example Analyzer directory to", appPath)
	cmd := exec.Command("cp", "-a", analyzerPath+"/.", ".")
	cmd.Dir = appPath

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	// Run the command
	err := cmd.Run()
	_, outErr := stdout.String(), stderr.String()
	if err != nil {
		t.Fatalf("Failed to copy the analyzer code to %s. Error:%s\n%s", appPath, err, outErr)
	}

	// Create the file to watch.
	log.Printf("Creating the file %s/analysis_results.json to watch for any analysis results", appPath)
	os.Create(fmt.Sprintf("%s/analysis_results.json", appPath))

	// Watch for the output file for any changes. Once the file is written, kill the dry-run process.
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		t.Error(err)
	}
	defer watcher.Close()

	done := make(chan bool)
	go func() {
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				t.Log("Event:", event)
				if event.Op&fsnotify.Write == fsnotify.Write {
					t.Log("Received write event for the results file. Modified file:", event.Name)

					// Kill the process once the file has been modified(the results have been received).
					log.Println("dry-run tested. KILLING THE PROCESS.")
					analysisCmd.Process.Kill()

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
					if !cmp.Equal(receivedAnalysisResults, expectedAnalysisResults) {
						diff := cmp.Diff(receivedAnalysisResults, expectedAnalysisResults)
						t.Errorf("Failed to verify analysis results. Expected: %s\n==========\nGot: %s\n=========\nDiff:%s", expectedAnalysisResults, receivedAnalysisResults, diff)
					}
					done <- true
				}
			case err, ok := <-watcher.Errors:
				if !ok {
					return
				}
				log.Println("Error:", err)
			}
		}
	}()

	err = watcher.Add(fmt.Sprintf("%s/analysis_results.json", appPath))
	if err != nil {
		t.Error(err)
	}

	/* =============================================================================
	 * Run the analyzer dry-run command on the testdata/todo-checker directory
	 * ============================================================================= */

	analysisCmd = exec.Command("/tmp/deepsource", "analyzer", "dry-run", analyzerPath, "--output-file", appPath)
	analysisCmd.Dir = appPath

	var stdout1, stderr1 bytes.Buffer
	analysisErr := analysisCmd.Run()
	_, outErr1 := stdout1.String(), stderr1.String()
	if err != nil {
		t.Errorf("Failed to run the analyzer. Error:%s\n%s", analysisErr, outErr1)
	}
	<-done
}
