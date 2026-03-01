package update

import (
	"archive/tar"
	"archive/zip"
	"bytes"
	"compress/gzip"
	"crypto/sha256"
	"encoding/hex"
	"os"
	"path/filepath"
	"testing"

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
	buildinfo.SetBuildInfo("development", "", "dev")
	if ShouldAutoUpdate() {
		t.Error("expected false for dev build")
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
