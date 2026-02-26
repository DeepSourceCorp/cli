package tests

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"

	"github.com/klauspost/compress/zstd"
	"github.com/deepsourcelabs/cli/command/report"
	"github.com/deepsourcelabs/cli/internal/adapters"
	"github.com/deepsourcelabs/cli/internal/container"
	"github.com/google/go-cmp/cmp"
)

// Workflow tested:
//
// - Run deepsource CLI with report command and value flag
// - Run deepsource CLI with report command and value-file flag

// Sample values to the run the analyzer on
const (
	analyzer = "test-coverage"
	key      = "python"
)

var dsn = "http://test-mock-token@localhost:8081"

func testDir() string {
	_, filename, _, ok := runtime.Caller(0)
	if !ok {
		return "."
	}
	return filepath.Dir(filename)
}

func goldenFilePath(name string) string {
	return filepath.Join(testDir(), "golden_files", name)
}

func graphQLAPIMock(w http.ResponseWriter, r *http.Request) {
	// Read request request request body
	req, err := io.ReadAll(r.Body)
	if err != nil {
		log.Println(err)
		return
	}

	// Check if the request has ArtifactMetadataInput in body
	if bytes.Contains(req, []byte("ArtifactMetadataInput")) {
		log.Println("ArtifactMetadataInput found in request body")
		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Type", "application/json")

		successResponseBodyData, err := os.ReadFile(goldenFilePath("report_grqphql_artifactmetadatainput_response_success.json"))
		if err != nil {
			log.Println(err)
			return
		}
		w.Write([]byte(successResponseBodyData))

	} else {

		// Unmarshal request body into ReportQuery
		var reportQuery report.ReportQuery
		err = json.Unmarshal(req, &reportQuery)
		if err != nil {
			log.Println(err)
			return
		}

		requestData := reportQuery.Variables.Input.Data

		// Decode base64 encoded data
		decodedData, err := base64.StdEncoding.DecodeString(requestData)
		if err != nil {
			log.Println(err)
			return
		}

		// Decompress zstd compressed data
		decoder, err := zstd.NewReader(nil)
		if err != nil {
			log.Println(err)
			return
		}
		defer decoder.Close()
		decompressedData, err := decoder.DecodeAll(decodedData, nil)
		if err != nil {
			log.Println(err)
			return
		}

		// Create new ReportQeury object with decompressed data
		reportQuery.Variables.Input.Data = string(decompressedData)

		// Read test graphql request body artifact file
		requestBodyGoldenFilePath := goldenFilePath("report_graphql_request_body.json")

		if reportQuery.Variables.Input.AnalyzerType == "community" {
			// There's a separate goldenfile for request made with a type flag passed as community
			requestBodyGoldenFilePath = goldenFilePath("report_graphql_community_request_body.json")
		}

		requestBodyData, err := os.ReadFile(requestBodyGoldenFilePath)
		if err != nil {
			log.Println(err)
			return
		}

		// Unmarshal request body into ReportQuery
		var requestReportQuery report.ReportQuery
		err = json.Unmarshal(requestBodyData, &requestReportQuery)
		if err != nil {
			log.Println(err)
			return
		}

		// Make a map for metadata with workdir and compressed.This is to make local tests respect env variables.
		metadata := make(map[string]interface{})
		metadata["workDir"] = os.Getenv("CODE_PATH")
		metadata["compressed"] = "True"
		requestReportQuery.Variables.Input.Metadata = metadata

		// Also change the ReporterVersion to the version of the CLI
		requestReportQuery.Variables.Input.ReporterVersion = report.CliVersion

		// Read test graphql success response body artifact file
		successResponseBodyData, err := os.ReadFile(goldenFilePath("report_graphql_success_response_body.json"))
		if err != nil {
			log.Println(err)
			return
		}

		// Read test graphql error response body artifact file
		errorResponseBodyData, err := os.ReadFile(goldenFilePath("report_graphql_error_response_body.json"))
		if err != nil {
			log.Println(err)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Type", "application/json")

		requestReportQuery.Variables.Input.Data = strings.TrimSuffix(requestReportQuery.Variables.Input.Data, "\n")
		reportQuery.Variables.Input.Data = strings.TrimSuffix(reportQuery.Variables.Input.Data, "\n")

		if want, got := requestReportQuery, reportQuery; cmp.Equal(want, got) {
			w.Write([]byte(successResponseBodyData))
		} else {
			log.Printf("Mismatch found:\nDiff: %s\n", cmp.Diff(want, got))
			w.Write([]byte(errorResponseBodyData))
		}
	}
}

func TestReportKeyValueWorkflow(t *testing.T) {
	// Read test artifact file
	data, err := os.ReadFile(coverageFilePath)
	if err != nil {
		t.Error(err)
	}

	outStr, errStr, err := runReportCommand(t, []string{
		"report",
		"--analyzer",
		analyzer,
		"--key",
		key,
		"--value",
		string(data),
	})
	log.Printf("== Run deepsource CLI command ==\n%s\n%s\n", outStr, errStr)

	if err != nil {
		log.Println(outStr)
		log.Println(errStr)
		t.Errorf("Error executing deepsource CLI command: %v", err)
	}

	output, err := os.ReadFile(goldenFilePath("report_success.txt"))
	if err != nil {
		t.Fatal(err)
	}

	if want := string(output); want != outStr {
		t.Errorf("Expected: %s, Got: %s", want, outStr)
	}
}

func TestReportKeyValueFileWorkflow(t *testing.T) {
	outStr, errStr, err := runReportCommand(t, []string{
		"report",
		"--analyzer",
		analyzer,
		"--key",
		key,
		"--value-file",
		coverageFilePath,
	})
	log.Printf("== Run deepsource CLI command ==\n%s\n%s\n", outStr, errStr)

	if err != nil {
		log.Println(outStr)
		log.Println(errStr)
		t.Errorf("Error executing deepsource CLI command: %v", err)
	}

	output, err := os.ReadFile(goldenFilePath("report_success.txt"))
	if err != nil {
		t.Fatal(err)
	}

	if want := string(output); want != outStr {
		t.Errorf("Expected: %s, Got: %s", want, outStr)
	}
}

func TestReportAnalyzerTypeWorkflow(t *testing.T) {
	outStr, errStr, err := runReportCommand(t, []string{
		"report",
		"--analyzer",
		analyzer,
		"--analyzer-type",
		"community",
		"--key",
		key,
		"--value-file",
		coverageFilePath,
	})
	log.Printf("== Run deepsource CLI command ==\n%s\n%s\n", outStr, errStr)

	if err != nil {
		log.Println(outStr)
		log.Println(errStr)
		t.Errorf("Error executing deepsource CLI command: %v", err)
	}

	output, err := os.ReadFile(goldenFilePath("report_success.txt"))
	if err != nil {
		t.Fatal(err)
	}

	if want := string(output); want != outStr {
		t.Errorf("Expected: %s, Got: %s", want, outStr)
	}
}

func runReportCommand(t *testing.T, args []string) (string, string, error) {
	t.Helper()
	t.Setenv("CODE_PATH", repoRoot)

	deps := container.NewTest()
	if env, ok := deps.Environment.(*adapters.MockEnvironment); ok {
		env.Set("DEEPSOURCE_DSN", dsn)
	}
	if git, ok := deps.GitClient.(*adapters.MockGitClient); ok {
		git.SetHead("b9e678d8dcb43fa1340e8a0c579b2c642280dc27", "")
	}
	if srv != nil {
		deps.HTTPClient = srv.Client()
	}

	origDir, err := os.Getwd()
	if err == nil {
		if repoRoot != "" {
			if chdirErr := os.Chdir(repoRoot); chdirErr == nil {
				defer os.Chdir(origDir)
			}
		}
	}

	cmd := report.NewCmdReportWithDeps(deps)
	cmd.SetArgs(args[1:])

	execErr := cmd.Execute()
	if output, ok := deps.Output.(*adapters.BufferOutput); ok {
		return output.String(), output.ErrorString(), execErr
	}
	return "", "", execErr
}
