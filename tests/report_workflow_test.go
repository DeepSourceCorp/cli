package tests

import (
	"io/ioutil"
	"log"
	"net/http"
	"testing"
)

func graphQLAPIMock(w http.ResponseWriter, r *http.Request) {
	req, _ := ioutil.ReadAll(r.Body)
	log.Println(string(req))

	// TODO: Verify values

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(""))

}

func TestReportWorkflow(t *testing.T) {
}
