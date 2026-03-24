package report

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/deepsourcelabs/cli/internal/adapters"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
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
		HTTPClient:  &mockHTTPClient{DoFunc: func(_ *http.Request) (*http.Response, error) { return nil, nil }},
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

func TestReportNoCompressionSupport(t *testing.T) {
	tempDir := t.TempDir()
	artifactPath := filepath.Join(tempDir, "coverage.xml")
	assert.NoError(t, os.WriteFile(artifactPath, []byte("<coverage/>"), 0o644))

	httpClient := &mockHTTPClient{DoFunc: func(req *http.Request) (*http.Response, error) {
		body, _ := io.ReadAll(req.Body)
		_ = req.Body.Close()
		if bytes.Contains(body, []byte("ArtifactMetadataInput")) {
			// No "compressed" in input fields
			payload := `{"data":{"__type":{"inputFields":[{"name":"data"}]}}}`
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
		Workdir:     func() (string, error) { return tempDir, nil },
	})

	result, err := svc.Report(context.Background(), Options{
		Analyzer:  "test-coverage",
		Key:       "python",
		ValueFile: artifactPath,
	})
	assert.NoError(t, err)
	if assert.NotNil(t, result) {
		assert.Equal(t, "ok", result.Message)
	}
}

func TestReportServerError(t *testing.T) {
	tempDir := t.TempDir()
	artifactPath := filepath.Join(tempDir, "coverage.xml")
	assert.NoError(t, os.WriteFile(artifactPath, []byte("<coverage/>"), 0o644))

	httpClient := &mockHTTPClient{DoFunc: func(req *http.Request) (*http.Response, error) {
		body, _ := io.ReadAll(req.Body)
		_ = req.Body.Close()
		if bytes.Contains(body, []byte("ArtifactMetadataInput")) {
			payload := `{"data":{"__type":{"inputFields":[]}}}`
			return httpResponse(200, payload), nil
		}
		return httpResponse(500, `{"error":"internal server error"}`), nil
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
		Workdir:     func() (string, error) { return tempDir, nil },
	})

	_, err := svc.Report(context.Background(), Options{
		Analyzer:  "test-coverage",
		Key:       "python",
		ValueFile: artifactPath,
	})
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "500")
}

func TestReportHTTPClientError(t *testing.T) {
	tempDir := t.TempDir()
	artifactPath := filepath.Join(tempDir, "coverage.xml")
	assert.NoError(t, os.WriteFile(artifactPath, []byte("<coverage/>"), 0o644))

	httpClient := &mockHTTPClient{DoFunc: func(req *http.Request) (*http.Response, error) {
		body, _ := io.ReadAll(req.Body)
		_ = req.Body.Close()
		if bytes.Contains(body, []byte("ArtifactMetadataInput")) {
			payload := `{"data":{"__type":{"inputFields":[]}}}`
			return httpResponse(200, payload), nil
		}
		return nil, errors.New("connection refused")
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
		Workdir:     func() (string, error) { return tempDir, nil },
	})

	_, err := svc.Report(context.Background(), Options{
		Analyzer:  "test-coverage",
		Key:       "python",
		ValueFile: artifactPath,
	})
	assert.Error(t, err)
}

func TestReportSkipCertVerification(t *testing.T) {
	tempDir := t.TempDir()
	artifactPath := filepath.Join(tempDir, "coverage.xml")
	assert.NoError(t, os.WriteFile(artifactPath, []byte("<coverage/>"), 0o644))

	callCount := 0
	httpClient := &mockHTTPClient{DoFunc: func(req *http.Request) (*http.Response, error) {
		callCount++
		body, _ := io.ReadAll(req.Body)
		_ = req.Body.Close()
		if bytes.Contains(body, []byte("ArtifactMetadataInput")) {
			payload := `{"data":{"__type":{"inputFields":[]}}}`
			return httpResponse(200, payload), nil
		}
		// The skipVerify path creates its own http.Client, so this mock
		// won't be used for the upload. Return success for compression check.
		return nil, errors.New("connection refused")
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
		Workdir:     func() (string, error) { return tempDir, nil },
	})

	// SkipCertificateVerification triggers the skipVerify branch in makeQuery
	_, err := svc.Report(context.Background(), Options{
		Analyzer:                    "test-coverage",
		Key:                         "python",
		ValueFile:                   artifactPath,
		SkipCertificateVerification: true,
	})
	// Will fail because the real http.Client can't connect to localhost:8080,
	// but the skipVerify code path IS exercised
	assert.Error(t, err)
}

func TestReportCreateArtifactError(t *testing.T) {
	tempDir := t.TempDir()
	artifactPath := filepath.Join(tempDir, "coverage.xml")
	assert.NoError(t, os.WriteFile(artifactPath, []byte("<coverage/>"), 0o644))

	httpClient := &mockHTTPClient{DoFunc: func(req *http.Request) (*http.Response, error) {
		body, _ := io.ReadAll(req.Body)
		_ = req.Body.Close()
		if bytes.Contains(body, []byte("ArtifactMetadataInput")) {
			payload := `{"data":{"__type":{"inputFields":[]}}}`
			return httpResponse(200, payload), nil
		}
		if bytes.Contains(body, []byte("createArtifact")) {
			payload := `{"data":{"createArtifact":{"ok":false,"message":"","error":"Invalid repository"}}}`
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
		Workdir:     func() (string, error) { return tempDir, nil },
	})

	_, err := svc.Report(context.Background(), Options{
		Analyzer:  "test-coverage",
		Key:       "python",
		ValueFile: artifactPath,
	})
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "Invalid repository")
}

func TestReportCreateArtifactEmptyError(t *testing.T) {
	tempDir := t.TempDir()
	artifactPath := filepath.Join(tempDir, "coverage.xml")
	assert.NoError(t, os.WriteFile(artifactPath, []byte("<coverage/>"), 0o644))

	httpClient := &mockHTTPClient{DoFunc: func(req *http.Request) (*http.Response, error) {
		body, _ := io.ReadAll(req.Body)
		_ = req.Body.Close()
		if bytes.Contains(body, []byte("ArtifactMetadataInput")) {
			payload := `{"data":{"__type":{"inputFields":[]}}}`
			return httpResponse(200, payload), nil
		}
		if bytes.Contains(body, []byte("createArtifact")) {
			payload := `{"data":{"createArtifact":{"ok":false,"message":"","error":""}}}`
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
		Workdir:     func() (string, error) { return tempDir, nil },
	})

	_, err := svc.Report(context.Background(), Options{
		Analyzer:  "test-coverage",
		Key:       "python",
		ValueFile: artifactPath,
	})
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "raw response")
}

func TestReportExplicitCommitSkipsGit(t *testing.T) {
	tempDir := t.TempDir()
	artifactPath := filepath.Join(tempDir, "coverage.xml")
	assert.NoError(t, os.WriteFile(artifactPath, []byte("<coverage/>"), 0o644))

	var capturedCommit string
	httpClient := &mockHTTPClient{DoFunc: func(req *http.Request) (*http.Response, error) {
		body, _ := io.ReadAll(req.Body)
		_ = req.Body.Close()
		if bytes.Contains(body, []byte("ArtifactMetadataInput")) {
			payload := `{"data":{"__type":{"inputFields":[]}}}`
			return httpResponse(200, payload), nil
		}
		if bytes.Contains(body, []byte("createArtifact")) {
			var q ReportQuery
			_ = json.Unmarshal(body, &q)
			capturedCommit = q.Variables.Input.CommitOID
			payload := `{"data":{"createArtifact":{"ok":true,"message":"ok","error":""}}}`
			return httpResponse(200, payload), nil
		}
		return httpResponse(400, `{"error":"unexpected"}`), nil
	}}

	// Git client returns an error — simulates no git repo available
	git := adapters.NewMockGitClient()
	git.SetError(errors.New("not a git repository"))
	env := adapters.NewMockEnvironment()
	env.Set("DEEPSOURCE_DSN", "https://token@localhost:8080")

	svc := NewService(ServiceDeps{
		GitClient:   git,
		HTTPClient:  httpClient,
		FileSystem:  adapters.NewOSFileSystem(),
		Environment: env,
		Sentry:      adapters.NewNoOpSentry(),
		Output:      adapters.NewBufferOutput(),
		Workdir:     func() (string, error) { return tempDir, nil },
	})

	result, err := svc.Report(context.Background(), Options{
		Analyzer:  "test-coverage",
		Key:       "python",
		ValueFile: artifactPath,
		CommitOID: "deadbeef1234567890abcdef1234567890abcdef",
	})

	assert.NoError(t, err)
	if assert.NotNil(t, result) {
		assert.Equal(t, "ok", result.Message)
	}
	assert.Equal(t, "deadbeef1234567890abcdef1234567890abcdef", capturedCommit)
}

func TestCaptureSkipsUserErrors(t *testing.T) {
	captured := false
	mockSentry := &captureSentry{onCapture: func(_ error) { captured = true }}

	svc := &Service{sentry: mockSentry}

	// User errors should not be captured
	svc.capture(errors.New("internal error"))
	assert.True(t, captured)

	captured = false
	svc.capture(clierrors.NewUserError(errors.New("bad input")))
	assert.False(t, captured)
}

func TestCaptureNilSentry(_ *testing.T) {
	svc := &Service{sentry: nil}
	// Should not panic
	svc.capture(errors.New("some error"))
}

type captureSentry struct {
	onCapture func(error)
}

func (*captureSentry) Init(_ string) error                        { return nil }
func (s *captureSentry) CaptureException(err error)               { s.onCapture(err) }
func (*captureSentry) CaptureMessage(_ string)                    {}
func (*captureSentry) ConfigureScope(_ func(scope interface{}))   {}
func (*captureSentry) Flush(_ time.Duration)                      {}
