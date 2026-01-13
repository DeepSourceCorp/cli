package tests

import (
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"testing"
)

var srv *httptest.Server
var coverageFilePath string
var repoRoot string

func TestMain(m *testing.M) {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	var err error
	srv, err = graphQLMockAPIServer()
	if err != nil {
		log.Printf("skipping report workflow tests: %v", err)
		os.Exit(0)
	}
	if srv != nil {
		if parsed, err := parseDSNFromURL(srv.URL); err == nil {
			dsn = parsed
		}
	}
	if err := prepareArtifacts(); err != nil {
		log.Printf("failed to prepare report artifacts: %v", err)
	}
	code := m.Run()
	srv.Close()
	os.Exit(code)
}

func graphQLMockAPIServer() (*httptest.Server, error) {
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return nil, err
	}
	server := httptest.NewUnstartedServer(http.HandlerFunc(graphQLAPIMock))
	server.Listener = listener
	server.Start()
	return server, nil
}

func parseDSNFromURL(raw string) (string, error) {
	parsed, err := url.Parse(raw)
	if err != nil {
		return "", err
	}
	if parsed.Host == "" {
		return "", fmt.Errorf("missing host in URL: %s", raw)
	}
	return fmt.Sprintf("%s://%s@%s", parsed.Scheme, "f59ab9314307", parsed.Host), nil
}

func prepareArtifacts() error {
	wd, err := os.Getwd()
	if err != nil {
		return err
	}

	rootDir := filepath.Clean(filepath.Join(wd, "..", "..", ".."))
	if envRoot := os.Getenv("CODE_PATH"); envRoot != "" {
		if _, err := os.Stat(envRoot); err == nil {
			rootDir = envRoot
		}
	}
	repoRoot = rootDir
	if os.Getenv("CODE_PATH") == "" {
		_ = os.Setenv("CODE_PATH", repoRoot)
	}

	tempDir, err := os.MkdirTemp("", "deepsource-report")
	if err != nil {
		return err
	}

	coverageSrc := filepath.Join(rootDir, "command", "report", "tests", "golden_files", "python_coverage.xml")
	coverageDst := filepath.Join(tempDir, "python_coverage.xml")
	if err := copyFile(coverageSrc, coverageDst); err != nil {
		return err
	}
	coverageFilePath = coverageDst

	return nil
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	if _, err := io.Copy(out, in); err != nil {
		return err
	}
	return out.Sync()
}
