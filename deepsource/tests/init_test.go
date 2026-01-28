package tests

import (
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"testing"
	"time"
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

	http.HandleFunc("/analyzer", mockAnalyzer)
	http.HandleFunc("/viewer", mockViewer)

	go func() {
		err := srv.ListenAndServe()
		if err != nil && err != http.ErrServerClosed {
			panic(fmt.Sprintf("failed to start HTTP mock server with error=%s", err))
		}
	}()

	// Wait for server to be ready
	for i := 0; i < 200; i++ {
		conn, err := net.Dial("tcp", "localhost:8081")
		if err == nil {
			conn.Close()
			return
		}
		time.Sleep(10 * time.Millisecond)
	}
	panic("mock server failed to start within timeout")
}
