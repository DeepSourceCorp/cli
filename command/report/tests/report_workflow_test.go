package tests

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"testing"

	"github.com/DataDog/zstd"
	"github.com/deepsourcelabs/cli/command/report"
	"github.com/google/go-cmp/cmp"
)

// Workflow tested:
//
// - Run deepsource CLI with report command and value flag
// - Run deepsource CLI with report command and value-file flag

// Sample values to the run the analyzer on
const (
	analyzer  = "test-coverage"
	commitOid = "b7ff1a5ecb0dce0541b935224f852ee98570bbd4"
	dsn       = "http://f59ab9314307@localhost:8081"
	key       = "python"
)

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

		successResponseBodyData, err := os.ReadFile("./golden_files/report_grqphql_artifactmetadatainput_response_success.json")
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
		decompressedData, err := zstd.Decompress(nil, decodedData)
		if err != nil {
			log.Println(err)
			return
		}

		// Create new ReportQeury object with decompressed data
		reportQuery.Variables.Input.Data = string(decompressedData)

		// Read test graphql request body artifact file
		requestBodyGoldenFilePath := "./golden_files/report_graphql_request_body.json"

		if reportQuery.Variables.Input.AnalyzerType == "community" {
			// There's a separate goldenfile for request made with a type flag passed as community
			requestBodyGoldenFilePath = "./golden_files/report_graphql_community_request_body.json"
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
		successResponseBodyData, err := os.ReadFile("./golden_files/report_graphql_success_response_body.json")
		if err != nil {
			log.Println(err)
			return
		}

		// Read test graphql error response body artifact file
		errorResponseBodyData, err := os.ReadFile("./golden_files/report_graphql_error_response_body.json")
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
			if want != got {
				log.Printf("Mismatch found:\nDiff: %s\n", cmp.Diff(want, got))
			}
			w.Write([]byte(errorResponseBodyData))
		}
	}
}

func TestReportKeyValueWorkflow(t *testing.T) {
	// Read test artifact file
	data, err := os.ReadFile("/tmp/python_coverage.xml")
	if err != nil {
		t.Error(err)
	}

	cmd := exec.Command("/tmp/deepsource",
		"report",
		"--analyzer",
		analyzer,
		"--key",
		key,
		"--value",
		string(data),
	)

	// Set env variables
	cmd.Env = os.Environ()
	cmd.Env = append(cmd.Env, "GIT_COMMIT_SHA="+"b9e678d8dcb43fa1340e8a0c579b2c642280dc27")
	cmd.Env = append(cmd.Env, "DEEPSOURCE_DSN="+dsn)
	cmd.Dir = os.Getenv("CODE_PATH")

	var stdout, stderr bytes.Buffer

	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err = cmd.Run()

	outStr, errStr := stdout.String(), stderr.String()
	log.Printf("== Run deepsource CLI command ==\n%s\n%s\n", outStr, errStr)

	if err != nil {
		log.Println(outStr)
		log.Println(errStr)
		t.Errorf("Error executing deepsource CLI command: %v", err)
	}

	output, err := os.ReadFile("./golden_files/report_success.txt")
	if err != nil {
		t.Fatal(err)
	}

	if want := string(output); want != outStr {
		t.Errorf("Expected: %s, Got: %s", want, outStr)
	}
}

func TestReportKeyValueFileWorkflow(t *testing.T) {
	cmd := exec.Command("/tmp/deepsource",
		"report",
		"--analyzer",
		analyzer,
		"--key",
		key,
		"--value-file",
		"/tmp/python_coverage.xml",
	)

	// Set env variables
	cmd.Env = os.Environ()
	cmd.Env = append(cmd.Env, "GIT_COMMIT_SHA="+"b9e678d8dcb43fa1340e8a0c579b2c642280dc27")
	cmd.Env = append(cmd.Env, "DEEPSOURCE_DSN="+dsn)
	cmd.Dir = os.Getenv("CODE_PATH")

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()

	outStr, errStr := stdout.String(), stderr.String()
	log.Printf("== Run deepsource CLI command ==\n%s\n%s\n", outStr, errStr)

	if err != nil {
		log.Println(outStr)
		log.Println(errStr)
		t.Errorf("Error executing deepsource CLI command: %v", err)
	}

	output, err := os.ReadFile("./golden_files/report_success.txt")
	if err != nil {
		t.Fatal(err)
	}

	if want := string(output); want != outStr {
		t.Errorf("Expected: %s, Got: %s", want, outStr)
	}
}

func TestReportAnalyzerTypeWorkflow(t *testing.T) {
	cmd := exec.Command("/tmp/deepsource",
		"report",
		"--analyzer",
		analyzer,
		"--analyzer-type",
		"community",
		"--key",
		key,
		"--value-file",
		"/tmp/python_coverage.xml",
	)

	// Set env variables
	cmd.Env = os.Environ()
	cmd.Env = append(cmd.Env, "GIT_COMMIT_SHA="+"b9e678d8dcb43fa1340e8a0c579b2c642280dc27")
	cmd.Env = append(cmd.Env, "DEEPSOURCE_DSN="+dsn)
	cmd.Dir = os.Getenv("CODE_PATH")

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()

	outStr, errStr := stdout.String(), stderr.String()
	log.Printf("== Run deepsource CLI command ==\n%s\n%s\n", outStr, errStr)

	if err != nil {
		log.Println(outStr)
		log.Println(errStr)
		t.Errorf("Error executing deepsource CLI command: %v", err)
	}

	output, err := os.ReadFile("./golden_files/report_success.txt")
	if err != nil {
		t.Fatal(err)
	}

	if want := string(output); want != outStr {
		t.Errorf("Expected: %s, Got: %s", want, outStr)
	}
}
