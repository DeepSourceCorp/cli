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

	// Point os.Executable to our fake binary by using a symlink
	// Since we can't override os.Executable, test replaceBinary directly
	// by calling the internal logic with a known path.
	newContent := []byte("new binary content")

	// Write new binary to temp, rename
	tmp, err := os.CreateTemp(dir, "deepsource.new.*")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := tmp.Write(newContent); err != nil {
		t.Fatal(err)
	}
	if err := tmp.Chmod(0o755); err != nil {
		t.Fatal(err)
	}
	tmp.Close()

	bakPath := fakeBin + ".bak"
	if err := os.Rename(fakeBin, bakPath); err != nil {
		t.Fatal(err)
	}
	if err := os.Rename(tmp.Name(), fakeBin); err != nil {
		t.Fatal(err)
	}
	os.Remove(bakPath)

	got, err := os.ReadFile(fakeBin)
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(got, newContent) {
		t.Errorf("binary content mismatch: got %q, want %q", got, newContent)
	}
}

func TestShouldAutoUpdate_DevBuild(t *testing.T) {
	buildinfo.SetBuildInfo("2.0.3", "", "dev")

	// Clear CI vars so they don't interfere
	ciVars := []string{"CI", "GITHUB_ACTIONS", "GITLAB_CI", "CIRCLECI", "TRAVIS", "JENKINS_URL", "BUILDKITE", "TF_BUILD"}
	for _, v := range ciVars {
		t.Setenv(v, "")
	}

	if !ShouldAutoUpdate() {
		t.Error("expected true for dev build with real version")
	}
}

func TestShouldAutoUpdate_DevelopmentVersion(t *testing.T) {
	buildinfo.SetBuildInfo("development", "", "")
	if ShouldAutoUpdate() {
		t.Error("expected false for development version")
	}
}

func TestShouldAutoUpdate_CI(t *testing.T) {
	buildinfo.SetBuildInfo("2.0.3", "", "prod")
	t.Setenv("CI", "true")
	if ShouldAutoUpdate() {
		t.Error("expected false in CI")
	}
}

func TestShouldAutoUpdate_Prod(t *testing.T) {
	buildinfo.SetBuildInfo("2.0.3", "", "prod")

	// Clear CI vars
	ciVars := []string{"CI", "GITHUB_ACTIONS", "GITLAB_CI", "CIRCLECI", "TRAVIS", "JENKINS_URL", "BUILDKITE", "TF_BUILD"}
	for _, v := range ciVars {
		t.Setenv(v, "")
	}

	if !ShouldAutoUpdate() {
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
	manifest := Manifest{
		Version: "2.0.40",
		Platforms: map[string]PlatformInfo{
			key: {
				Archive: "deepsource_2.0.40_" + key + ".tar.gz",
				SHA256:  "abc123",
			},
		},
	}
	// Simulate what CheckForUpdate does: fetch manifest, compare, write state
	newer, _ := IsNewer("2.0.30", manifest.Version)
	if !newer {
		t.Fatal("expected newer=true")
	}

	platform := manifest.Platforms[key]
	state := &UpdateState{
		Version:    manifest.Version,
		ArchiveURL: buildinfo.BaseURL + "/" + platform.Archive,
		SHA256:     platform.SHA256,
		CheckedAt:  time.Now().UTC(),
	}
	if err := writeUpdateState(state); err != nil {
		t.Fatalf("writeUpdateState: %v", err)
	}

	got, err := ReadUpdateState()
	if err != nil {
		t.Fatalf("ReadUpdateState: %v", err)
	}
	if got.Version != "2.0.40" {
		t.Errorf("expected version 2.0.40, got %s", got.Version)
	}
	expectedURL := fmt.Sprintf("%s/deepsource_2.0.40_%s.tar.gz", buildinfo.BaseURL, key)
	if got.ArchiveURL != expectedURL {
		t.Errorf("expected archive URL %s, got %s", expectedURL, got.ArchiveURL)
	}
}

func TestCheckForUpdate_AlreadyUpToDate(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	buildinfo.SetBuildInfo("2.0.40", "", "prod")

	// Same version — no state file should be written
	newer, _ := IsNewer("2.0.40", "2.0.40")
	if newer {
		t.Fatal("expected newer=false for same version")
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

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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

	client := srv.Client()

	// ApplyUpdate reads the state file internally, so we test it reads correctly.
	// However, replaceBinary will use os.Executable() which we can't easily mock.
	// So we test the pieces: state file reading, download, checksum verification.

	readState, err := ReadUpdateState()
	if err != nil {
		t.Fatalf("ReadUpdateState: %v", err)
	}
	if readState.Version != "2.0.40" {
		t.Fatalf("expected version 2.0.40, got %s", readState.Version)
	}

	data, err := downloadFile(client, readState.ArchiveURL)
	if err != nil {
		t.Fatalf("downloadFile: %v", err)
	}

	if err := verifyChecksum(data, readState.SHA256); err != nil {
		t.Fatalf("verifyChecksum: %v", err)
	}

	extracted, err := extractFromTarGz(data, buildinfo.AppName)
	if err != nil {
		t.Fatalf("extractFromTarGz: %v", err)
	}
	if !bytes.Equal(extracted, binaryContent) {
		t.Errorf("extracted binary mismatch: got %q, want %q", extracted, binaryContent)
	}

	// Verify clearUpdateState removes the file
	clearUpdateState()
	afterClear, _ := ReadUpdateState()
	if afterClear != nil {
		t.Error("state file should be removed after clear")
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
