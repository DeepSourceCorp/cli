package report

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/deepsourcelabs/cli/internal/adapters"
	"github.com/stretchr/testify/assert"
)

type mockHTTPClient struct {
	DoFunc func(req *http.Request) (*http.Response, error)
}

func (m *mockHTTPClient) Do(req *http.Request) (*http.Response, error) {
	return m.DoFunc(req)
}

func TestReportSuccess(t *testing.T) {
	tempDir := t.TempDir()
	artifactPath := filepath.Join(tempDir, "coverage.xml")
	assert.NoError(t, os.WriteFile(artifactPath, []byte("<coverage/>"), 0o644))

	httpClient := &mockHTTPClient{DoFunc: func(req *http.Request) (*http.Response, error) {
		body, _ := io.ReadAll(req.Body)
		_ = req.Body.Close()
		if bytes.Contains(body, []byte("ArtifactMetadataInput")) {
			payload := `{"data":{"__type":{"inputFields":[{"name":"compressed"}]}}}`
			return httpResponse(200, payload), nil
		}
		if bytes.Contains(body, []byte("createArtifact")) {
			payload := `{"data":{"createArtifact":{"ok":true,"message":"ok","error":""}}}`
			return httpResponse(200, payload), nil
		}
		return httpResponse(400, `{"error":"unexpected"}`), nil
	}}

	git := adapters.NewMockGitClient()
	git.SetHead("abc123", "")
	env := adapters.NewMockEnvironment()
	env.Set("DEEPSOURCE_DSN", "https://token@localhost:8080")

	svc := NewService(ServiceDeps{
		GitClient:   git,
		HTTPClient:  httpClient,
		FileSystem:  adapters.NewOSFileSystem(),
		Environment: env,
		Sentry:      adapters.NewNoOpSentry(),
		Output:      adapters.NewBufferOutput(),
		Workdir: func() (string, error) {
			return tempDir, nil
		},
	})

	result, err := svc.Report(context.Background(), Options{
		Analyzer:  "test-coverage",
		Key:       "python",
		ValueFile: artifactPath,
	})

	assert.NoError(t, err)
	if assert.NotNil(t, result) {
		assert.Equal(t, "test-coverage", result.Analyzer)
		assert.Equal(t, "python", result.Key)
		assert.Equal(t, "ok", result.Message)
	}
}

func TestReportMissingValue(t *testing.T) {
	git := adapters.NewMockGitClient()
	git.SetHead("abc123", "")
	env := adapters.NewMockEnvironment()
	env.Set("DEEPSOURCE_DSN", "https://token@localhost:8080")

	svc := NewService(ServiceDeps{
		GitClient:   git,
		HTTPClient:  &mockHTTPClient{DoFunc: func(req *http.Request) (*http.Response, error) { return nil, nil }},
		FileSystem:  adapters.NewOSFileSystem(),
		Environment: env,
		Sentry:      adapters.NewNoOpSentry(),
		Workdir: func() (string, error) {
			return "/tmp", nil
		},
	})

	_, err := svc.Report(context.Background(), Options{Analyzer: "test-coverage", Key: "python"})
	assert.Error(t, err)
	assert.True(t, strings.Contains(err.Error(), "--value"))
}

func httpResponse(code int, body string) *http.Response {
	return &http.Response{
		StatusCode: code,
		Body:       io.NopCloser(bytes.NewBufferString(body)),
		Header:     make(http.Header),
	}
}

func TestReportJSONQueryPayload(t *testing.T) {
	input := ReportQuery{Query: reportGraphqlQuery}
	input.Variables.Input = ReportQueryInput{AccessToken: "token"}
	payload, err := json.Marshal(input)
	assert.NoError(t, err)
	assert.True(t, strings.Contains(string(payload), "createArtifact"))
}
