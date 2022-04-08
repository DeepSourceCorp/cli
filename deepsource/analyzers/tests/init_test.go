package tests

import (
	"log"
	"net/http"
	"os"
	"testing"
)

var srv *http.Server

func TestMain(m *testing.M) {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	startMockAPIServer()

	code := m.Run()

	srv.Close()
	os.Exit(code)
}

func startMockAPIServer() {
	// Start GraphQL server for test
	srv = &http.Server{
		Addr: ":8081",
	}

	http.HandleFunc("/", graphQLAPIMock)

	go func() {
		err := srv.ListenAndServe()
		if err != nil {
			panic("Error starting HTTP mock server")
		}
	}()
}
