package tests

import (
	"bytes"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"testing"
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
	req, _ := io.ReadAll(r.Body)

	// Read test graphql request body artifact file
	requestBodyData, err := os.ReadFile("./golden_files/report_graphql_request_body.json")
	if err != nil {
		log.Println(err)
		return
	}

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

	if string(requestBodyData) == string(req) {
		log.Println("yay")
		w.Write([]byte(successResponseBodyData))
	} else {
		log.Println("nay")
		w.Write([]byte(errorResponseBodyData))
	}
}

func TestReportKeyValueWorkflow(t *testing.T) {
	t.Setenv("GIT_COMMIT_SHA", commitOid)

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
	t.Setenv("GIT_COMMIT_SHA", commitOid)

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
