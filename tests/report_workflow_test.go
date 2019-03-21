package tests

import (
	"bytes"
	"io/ioutil"
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
	analyzer  = "test_coverage"
	dsn       = "http://f59ab9314307@localhost:8081"
	commitOID = "c2d16c69dbcba139002757b6734ee43c714845a3"
	key       = "python"
)

func graphQLAPIMock(w http.ResponseWriter, r *http.Request) {
	req, _ := ioutil.ReadAll(r.Body)
	log.Println(string(req))

	// Read test graphql request body artifact file
	requestBodyData, err := ioutil.ReadFile("./dummy/report_graphql_request_body.json")
	if err != nil {
		log.Println(err)
		return
	}

	// Read test graphql success response body artifact file
	successResponseBodyData, err := ioutil.ReadFile("./dummy/report_graphql_success_response_body.json")
	if err != nil {
		log.Println(err)
		return
	}

	// Read test graphql error response body artifact file
	errorResponseBodyData, err := ioutil.ReadFile("./dummy/report_graphql_success_response_body.json")
	if err != nil {
		log.Println(err)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")

	if string(requestBodyData) == string(req) {
		w.Write([]byte(successResponseBodyData))
	} else {

		w.Write([]byte(errorResponseBodyData))
	}
}

func TestReportKeyValueWorkflow(t *testing.T) {
	// Start GraphQL server for test
	srv := &http.Server{
		Addr: ":8081",
	}

	http.HandleFunc("/", graphQLAPIMock)

	go func() {
		err := srv.ListenAndServe()
		if err != nil {
			t.Errorf("Error starting HTTP mock server")
		}
	}()

	// Read test artifact file
	data, err := ioutil.ReadFile("./dummy/python_coverage.xml")
	if err != nil {
		t.Errorf(err.Error())
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
	cmd.Dir = "/code"

	var stdout, stderr bytes.Buffer

	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err = cmd.Run()

	outStr, errStr := string(stdout.Bytes()), string(stderr.Bytes())
	log.Printf("== Run deepsource CLI command ==\n%s\n%s\n", outStr, errStr)

	if err != nil {
		t.Errorf("Error executing deepsource CLI command: %v", err)
	}
}

func TestReportKeyValueFileWorkflow(t *testing.T) {
	// Start GraphQL server for test
	srv := &http.Server{
		Addr: ":8081",
	}

	http.HandleFunc("/", graphQLAPIMock)

	go func() {
		err := srv.ListenAndServe()
		if err != nil {
			t.Errorf("Error starting HTTP mock server")
		}
	}()

	cmd := exec.Command("/tmp/deepsource",
		"report",
		"--analyzer",
		analyzer,
		"--key",
		key,
		"--value-file",
		"/go/src/github.com/deepsourcelabs/cli/tests/dummy/python_coverage.xml",
	)

	// Set env variables
	cmd.Env = os.Environ()
	cmd.Env = append(cmd.Env, "DEEPSOURCE_DSN="+dsn)
	cmd.Dir = "/code"

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()

	outStr, errStr := string(stdout.Bytes()), string(stderr.Bytes())
	log.Printf("== Run deepsource CLI command ==\n%s\n%s\n", outStr, errStr)

	if err != nil {
		log.Println(outStr)
		log.Println(errStr)
		t.Errorf("Error executing deepsource CLI command: %v", err)
	}
}
