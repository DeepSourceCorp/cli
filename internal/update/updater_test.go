package update

import (
	"archive/tar"
	"archive/zip"
	"bytes"
	"compress/gzip"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"runtime"
	"testing"
	"time"

	"github.com/deepsourcelabs/cli/buildinfo"
)

func TestVerifyChecksum(t *testing.T) {
	data := []byte("hello world")
	h := sha256.Sum256(data)
	good := hex.EncodeToString(h[:])

	if err := verifyChecksum(data, good); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if err := verifyChecksum(data, "0000000000000000000000000000000000000000000000000000000000000000"); err == nil {
		t.Fatal("expected checksum mismatch error")
	}
}

func TestExtractFromTarGz(t *testing.T) {
	content := []byte("#!/bin/sh\necho hi\n")
	archive := createTarGz(t, "deepsource", content)

	got, err := extractFromTarGz(archive, "deepsource")
	if err != nil {
		t.Fatalf("extractFromTarGz: %v", err)
	}
	if !bytes.Equal(got, content) {
		t.Errorf("extracted content mismatch: got %q, want %q", got, content)
	}
}

func TestExtractFromTarGz_NotFound(t *testing.T) {
	content := []byte("data")
	archive := createTarGz(t, "other-binary", content)

	_, err := extractFromTarGz(archive, "deepsource")
	if err == nil {
		t.Fatal("expected error for missing binary")
	}
}

func TestExtractFromZip(t *testing.T) {
	content := []byte("windows binary data")
	archive := createZip(t, "deepsource.exe", content)

	got, err := extractFromZip(archive, "deepsource.exe")
	if err != nil {
		t.Fatalf("extractFromZip: %v", err)
	}
	if !bytes.Equal(got, content) {
		t.Errorf("extracted content mismatch: got %q, want %q", got, content)
	}
}

func TestExtractFromZip_NotFound(t *testing.T) {
	content := []byte("data")
	archive := createZip(t, "other.exe", content)

	_, err := extractFromZip(archive, "deepsource.exe")
	if err == nil {
		t.Fatal("expected error for missing binary")
	}
}

func TestReplaceBinary(t *testing.T) {
	dir := t.TempDir()
	fakeBin := filepath.Join(dir, "deepsource")
	if err := os.WriteFile(fakeBin, []byte("old"), 0o755); err != nil {
		t.Fatal(err)
	}

	newContent := []byte("new binary content")
	if err := replaceBinaryAt(newContent, fakeBin); err != nil {
		t.Fatalf("replaceBinaryAt: %v", err)
	}

	got, err := os.ReadFile(fakeBin)
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(got, newContent) {
		t.Errorf("binary content mismatch: got %q, want %q", got, newContent)
	}
}

func TestShouldCheckForUpdate_DevBuild(t *testing.T) {
	buildinfo.SetBuildInfo("2.0.3", "", "dev")

	// Clear CI vars so they don't interfere
	ciVars := []string{"CI", "GITHUB_ACTIONS", "GITLAB_CI", "CIRCLECI", "TRAVIS", "JENKINS_URL", "BUILDKITE", "TF_BUILD"}
	for _, v := range ciVars {
		t.Setenv(v, "")
	}

	if !ShouldCheckForUpdate() {
		t.Error("expected true for dev build with real version")
	}
}

func TestShouldCheckForUpdate_DevelopmentVersion(t *testing.T) {
	buildinfo.SetBuildInfo("development", "", "")
	if ShouldCheckForUpdate() {
		t.Error("expected false for development version")
	}
}

func TestShouldCheckForUpdate_CI(t *testing.T) {
	buildinfo.SetBuildInfo("2.0.3", "", "prod")
	t.Setenv("CI", "true")
	if ShouldCheckForUpdate() {
		t.Error("expected false in CI")
	}
}

func TestShouldCheckForUpdate_Prod(t *testing.T) {
	buildinfo.SetBuildInfo("2.0.3", "", "prod")

	// Clear CI vars
	ciVars := []string{"CI", "GITHUB_ACTIONS", "GITLAB_CI", "CIRCLECI", "TRAVIS", "JENKINS_URL", "BUILDKITE", "TF_BUILD"}
	for _, v := range ciVars {
		t.Setenv(v, "")
	}

	if !ShouldCheckForUpdate() {
		t.Error("expected true for prod build outside CI")
	}
}

func TestUpdateState_WriteReadClear(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	state := &UpdateState{
		Version:    "2.0.40",
		ArchiveURL: "https://cli.deepsource.com/deepsource_2.0.40_darwin_arm64.tar.gz",
		SHA256:     "d1717cf33a200d143995c63be28661ed6d21c1380874f3057d3f25f6d9e2b99a",
		CheckedAt:  time.Date(2026, 3, 1, 20, 0, 0, 0, time.UTC),
	}

	if err := writeUpdateState(state); err != nil {
		t.Fatalf("writeUpdateState: %v", err)
	}

	got, err := ReadUpdateState()
	if err != nil {
		t.Fatalf("ReadUpdateState: %v", err)
	}
	if got == nil {
		t.Fatal("expected non-nil state")
	}
	if got.Version != state.Version {
		t.Errorf("version: got %q, want %q", got.Version, state.Version)
	}
	if got.ArchiveURL != state.ArchiveURL {
		t.Errorf("archive_url: got %q, want %q", got.ArchiveURL, state.ArchiveURL)
	}
	if got.SHA256 != state.SHA256 {
		t.Errorf("sha256: got %q, want %q", got.SHA256, state.SHA256)
	}
	if !got.CheckedAt.Equal(state.CheckedAt) {
		t.Errorf("checked_at: got %v, want %v", got.CheckedAt, state.CheckedAt)
	}

	clearUpdateState()

	got, err = ReadUpdateState()
	if err != nil {
		t.Fatalf("ReadUpdateState after clear: %v", err)
	}
	if got != nil {
		t.Error("expected nil state after clear")
	}
}

func TestReadUpdateState_NoFile(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	got, err := ReadUpdateState()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got != nil {
		t.Error("expected nil state when no file exists")
	}
}

func TestCheckForUpdate_NewerVersion(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	buildinfo.SetBuildInfo("2.0.30", "", "prod")

	key := runtime.GOOS + "_" + runtime.GOARCH
	manifestJSON := fmt.Sprintf(`{
		"version": "2.0.40",
		"platforms": {
			%q: {
				"archive": "deepsource_2.0.40_%s.tar.gz",
				"sha256": "abc123"
			}
		}
	}`, key, key)

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Write([]byte(manifestJSON))
	}))
	defer srv.Close()

	// Point manifest fetch at our test server
	origBaseURL := buildinfo.BaseURL
	buildinfo.BaseURL = srv.URL
	defer func() { buildinfo.BaseURL = origBaseURL }()

	if err := CheckForUpdate(srv.Client()); err != nil {
		t.Fatalf("CheckForUpdate: %v", err)
	}

	got, err := ReadUpdateState()
	if err != nil {
		t.Fatalf("ReadUpdateState: %v", err)
	}
	if got == nil {
		t.Fatal("expected non-nil state")
	}
	if got.Version != "2.0.40" {
		t.Errorf("expected version 2.0.40, got %s", got.Version)
	}
	expectedURL := fmt.Sprintf("%s/build/deepsource_2.0.40_%s.tar.gz", srv.URL, key)
	if got.ArchiveURL != expectedURL {
		t.Errorf("expected archive URL %s, got %s", expectedURL, got.ArchiveURL)
	}
}

func TestCheckForUpdate_AlreadyUpToDate(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	buildinfo.SetBuildInfo("2.0.40", "", "prod")

	key := runtime.GOOS + "_" + runtime.GOARCH
	manifestJSON := fmt.Sprintf(`{
		"version": "2.0.40",
		"platforms": {
			%q: {
				"archive": "deepsource_2.0.40_%s.tar.gz",
				"sha256": "abc123"
			}
		}
	}`, key, key)

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Write([]byte(manifestJSON))
	}))
	defer srv.Close()

	origBaseURL := buildinfo.BaseURL
	buildinfo.BaseURL = srv.URL
	defer func() { buildinfo.BaseURL = origBaseURL }()

	if err := CheckForUpdate(srv.Client()); err != nil {
		t.Fatalf("CheckForUpdate: %v", err)
	}

	got, err := ReadUpdateState()
	if err != nil {
		t.Fatalf("ReadUpdateState: %v", err)
	}
	if got != nil {
		t.Error("expected no state file for up-to-date version")
	}
}

func TestApplyUpdate_WithStateFile(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	buildinfo.SetBuildInfo("2.0.30", "", "prod")

	binaryContent := []byte("new deepsource binary")
	archive := createTarGz(t, buildinfo.AppName, binaryContent)
	checksum := sha256.Sum256(archive)
	checksumHex := hex.EncodeToString(checksum[:])

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Write(archive)
	}))
	defer srv.Close()

	state := &UpdateState{
		Version:    "2.0.40",
		ArchiveURL: srv.URL + "/deepsource_2.0.40.tar.gz",
		SHA256:     checksumHex,
		CheckedAt:  time.Now().UTC(),
	}
	if err := writeUpdateState(state); err != nil {
		t.Fatalf("writeUpdateState: %v", err)
	}

	// Create a fake binary so replaceBinary can replace it
	fakeBin := filepath.Join(t.TempDir(), buildinfo.AppName)
	if err := os.WriteFile(fakeBin, []byte("old binary"), 0o755); err != nil {
		t.Fatal(err)
	}

	// Override executablePath to point to our fake binary
	origExecPath := executablePath
	executablePath = func() (string, error) { return fakeBin, nil }
	defer func() { executablePath = origExecPath }()

	ver, err := ApplyUpdate(srv.Client())
	if err != nil {
		t.Fatalf("ApplyUpdate: %v", err)
	}
	if ver != "2.0.40" {
		t.Errorf("expected version 2.0.40, got %s", ver)
	}

	// Verify the binary was actually replaced
	got, err := os.ReadFile(fakeBin)
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(got, binaryContent) {
		t.Errorf("binary content mismatch: got %q, want %q", got, binaryContent)
	}

	// Verify state file was cleared
	afterApply, _ := ReadUpdateState()
	if afterApply != nil {
		t.Error("state file should be removed after apply")
	}
}

func TestApplyUpdate_NoStateFile(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	client := &http.Client{Timeout: 1 * time.Second}
	ver, err := ApplyUpdate(client)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if ver != "" {
		t.Errorf("expected empty version, got %q", ver)
	}
}

func TestCheckForUpdate_NoBuildInfo(t *testing.T) {
	buildinfo.ClearBuildInfo()
	err := CheckForUpdate(&http.Client{})
	if err == nil {
		t.Fatal("expected error when build info is nil")
	}
}

func TestCheckForUpdate_NoPlatform(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	buildinfo.SetBuildInfo("2.0.30", "", "prod")

	// Manifest with no matching platform
	manifestJSON := `{"version": "2.0.40", "platforms": {"fake_arch": {"archive": "a.tar.gz", "sha256": "abc"}}}`
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Write([]byte(manifestJSON))
	}))
	defer srv.Close()

	origBaseURL := buildinfo.BaseURL
	buildinfo.BaseURL = srv.URL
	defer func() { buildinfo.BaseURL = origBaseURL }()

	err := CheckForUpdate(srv.Client())
	if err == nil {
		t.Fatal("expected error for missing platform")
	}
}

func TestFetchManifest(t *testing.T) {
	key := runtime.GOOS + "_" + runtime.GOARCH
	manifestJSON := fmt.Sprintf(`{
		"version": "2.0.50",
		"buildTime": "2026-03-01T00:00:00Z",
		"platforms": {%q: {"archive": "a.tar.gz", "sha256": "abc"}}
	}`, key)

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Write([]byte(manifestJSON))
	}))
	defer srv.Close()

	origBaseURL := buildinfo.BaseURL
	buildinfo.BaseURL = srv.URL
	defer func() { buildinfo.BaseURL = origBaseURL }()

	m, err := FetchManifest(srv.Client())
	if err != nil {
		t.Fatalf("FetchManifest: %v", err)
	}
	if m.Version != "2.0.50" {
		t.Errorf("expected version 2.0.50, got %s", m.Version)
	}
	if _, ok := m.Platforms[key]; !ok {
		t.Errorf("expected platform %s in manifest", key)
	}
}

func TestFetchManifest_HTTPError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	defer srv.Close()

	origBaseURL := buildinfo.BaseURL
	buildinfo.BaseURL = srv.URL
	defer func() { buildinfo.BaseURL = origBaseURL }()

	_, err := FetchManifest(srv.Client())
	if err == nil {
		t.Fatal("expected error for HTTP 500")
	}
}

func TestFetchManifest_InvalidJSON(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Write([]byte("not json"))
	}))
	defer srv.Close()

	origBaseURL := buildinfo.BaseURL
	buildinfo.BaseURL = srv.URL
	defer func() { buildinfo.BaseURL = origBaseURL }()

	_, err := FetchManifest(srv.Client())
	if err == nil {
		t.Fatal("expected error for invalid JSON")
	}
}

func TestDownloadFile(t *testing.T) {
	content := []byte("file data")
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Write(content)
	}))
	defer srv.Close()

	data, err := downloadFile(srv.Client(), srv.URL+"/file")
	if err != nil {
		t.Fatalf("downloadFile: %v", err)
	}
	if !bytes.Equal(data, content) {
		t.Errorf("got %q, want %q", data, content)
	}
}

func TestDownloadFile_HTTPError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNotFound)
	}))
	defer srv.Close()

	_, err := downloadFile(srv.Client(), srv.URL+"/missing")
	if err == nil {
		t.Fatal("expected error for HTTP 404")
	}
}

func TestApplyUpdate_ChecksumMismatch(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	archive := createTarGz(t, buildinfo.AppName, []byte("binary"))
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Write(archive)
	}))
	defer srv.Close()

	state := &UpdateState{
		Version:    "2.0.40",
		ArchiveURL: srv.URL + "/archive.tar.gz",
		SHA256:     "0000000000000000000000000000000000000000000000000000000000000000",
		CheckedAt:  time.Now().UTC(),
	}
	if err := writeUpdateState(state); err != nil {
		t.Fatal(err)
	}

	fakeBin := filepath.Join(t.TempDir(), buildinfo.AppName)
	if err := os.WriteFile(fakeBin, []byte("old"), 0o755); err != nil {
		t.Fatal(err)
	}
	origExecPath := executablePath
	executablePath = func() (string, error) { return fakeBin, nil }
	defer func() { executablePath = origExecPath }()

	_, err := ApplyUpdate(srv.Client())
	if err == nil {
		t.Fatal("expected checksum mismatch error")
	}
}

func TestApplyUpdate_ZipArchive(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	buildinfo.SetBuildInfo("2.0.30", "", "prod")

	binaryContent := []byte("new deepsource binary from zip")
	binaryName := buildinfo.AppName
	if runtime.GOOS == "windows" {
		binaryName += ".exe"
	}
	archive := createZip(t, binaryName, binaryContent)
	checksum := sha256.Sum256(archive)
	checksumHex := hex.EncodeToString(checksum[:])

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Write(archive)
	}))
	defer srv.Close()

	state := &UpdateState{
		Version:    "2.0.40",
		ArchiveURL: srv.URL + "/deepsource_2.0.40.zip",
		SHA256:     checksumHex,
		CheckedAt:  time.Now().UTC(),
	}
	if err := writeUpdateState(state); err != nil {
		t.Fatal(err)
	}

	fakeBin := filepath.Join(t.TempDir(), binaryName)
	if err := os.WriteFile(fakeBin, []byte("old"), 0o755); err != nil {
		t.Fatal(err)
	}
	origExecPath := executablePath
	executablePath = func() (string, error) { return fakeBin, nil }
	defer func() { executablePath = origExecPath }()

	ver, err := ApplyUpdate(srv.Client())
	if err != nil {
		t.Fatalf("ApplyUpdate: %v", err)
	}
	if ver != "2.0.40" {
		t.Errorf("expected version 2.0.40, got %s", ver)
	}

	got, err := os.ReadFile(fakeBin)
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(got, binaryContent) {
		t.Errorf("binary content mismatch: got %q, want %q", got, binaryContent)
	}
}

func TestApplyUpdate_DownloadError(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	defer srv.Close()

	state := &UpdateState{
		Version:    "2.0.40",
		ArchiveURL: srv.URL + "/archive.tar.gz",
		SHA256:     "abc",
		CheckedAt:  time.Now().UTC(),
	}
	if err := writeUpdateState(state); err != nil {
		t.Fatal(err)
	}

	_, err := ApplyUpdate(srv.Client())
	if err == nil {
		t.Fatal("expected download error")
	}
}

func TestDownloadFile_NetworkError(t *testing.T) {
	client := &http.Client{Timeout: 1 * time.Second}
	_, err := downloadFile(client, "http://127.0.0.1:1/nonexistent")
	if err == nil {
		t.Fatal("expected network error")
	}
}

func TestFetchManifest_NetworkError(t *testing.T) {
	origBaseURL := buildinfo.BaseURL
	buildinfo.BaseURL = "http://127.0.0.1:1"
	defer func() { buildinfo.BaseURL = origBaseURL }()

	client := &http.Client{Timeout: 1 * time.Second}
	_, err := FetchManifest(client)
	if err == nil {
		t.Fatal("expected network error")
	}
}

func TestPlatformKey(t *testing.T) {
	key := PlatformKey()
	expected := runtime.GOOS + "_" + runtime.GOARCH
	if key != expected {
		t.Errorf("PlatformKey() = %q, want %q", key, expected)
	}
}

// helpers

func createTarGz(t *testing.T, name string, content []byte) []byte {
	t.Helper()
	var buf bytes.Buffer
	gw := gzip.NewWriter(&buf)
	tw := tar.NewWriter(gw)

	hdr := &tar.Header{
		Name: name,
		Size: int64(len(content)),
		Mode: 0o755,
	}
	if err := tw.WriteHeader(hdr); err != nil {
		t.Fatal(err)
	}
	if _, err := tw.Write(content); err != nil {
		t.Fatal(err)
	}
	tw.Close()
	gw.Close()
	return buf.Bytes()
}

func createZip(t *testing.T, name string, content []byte) []byte {
	t.Helper()
	var buf bytes.Buffer
	zw := zip.NewWriter(&buf)

	fw, err := zw.Create(name)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := fw.Write(content); err != nil {
		t.Fatal(err)
	}
	zw.Close()
	return buf.Bytes()
}
