package update

import (
	"archive/tar"
	"archive/zip"
	"bytes"
	"compress/gzip"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	"github.com/deepsourcelabs/cli/buildinfo"
	"github.com/deepsourcelabs/cli/internal/debug"
)

// executablePath returns the current executable path. Overridable in tests.
var executablePath = os.Executable

// UpdateState is the on-disk state written by CheckForUpdate and consumed by ApplyUpdate.
type UpdateState struct {
	Version    string    `json:"version"`
	ArchiveURL string    `json:"archive_url"`
	SHA256     string    `json:"sha256"`
	CheckedAt  time.Time `json:"checked_at"`
}

// updateStatePath returns the path to the update state file (~/.deepsource/update.json).
func updateStatePath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("getting home directory: %w", err)
	}
	return filepath.Join(home, buildinfo.ConfigDirName, "update.json"), nil
}

// ReadUpdateState reads the update state file. Returns nil if the file does not exist.
func ReadUpdateState() (*UpdateState, error) {
	p, err := updateStatePath()
	if err != nil {
		return nil, err
	}
	data, err := os.ReadFile(p)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return nil, nil
		}
		return nil, fmt.Errorf("reading update state: %w", err)
	}
	var s UpdateState
	if err := json.Unmarshal(data, &s); err != nil {
		return nil, fmt.Errorf("parsing update state: %w", err)
	}
	return &s, nil
}

func writeUpdateState(s *UpdateState) error {
	data, err := json.MarshalIndent(s, "", "  ")
	if err != nil {
		return fmt.Errorf("marshaling update state: %w", err)
	}
	p, err := updateStatePath()
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(p), 0o750); err != nil {
		return fmt.Errorf("creating config dir: %w", err)
	}
	if err := os.WriteFile(p, data, 0o644); err != nil {
		return fmt.Errorf("writing update state: %w", err)
	}
	return nil
}

func clearUpdateState() {
	p, err := updateStatePath()
	if err != nil {
		return
	}
	_ = os.Remove(p)
}

// CheckForUpdate fetches the manifest, compares versions, and writes a state
// file if a newer version is available. This is meant to be fast (~100-200ms).
func CheckForUpdate(client *http.Client) error {
	bi := buildinfo.GetBuildInfo()
	if bi == nil {
		return fmt.Errorf("build info not set")
	}

	manifest, err := FetchManifest(client)
	if err != nil {
		return err
	}

	newer, err := IsNewer(bi.Version, manifest.Version)
	if err != nil {
		return err
	}
	if !newer {
		debug.Log("update: already up to date (current=%s, remote=%s)", bi.Version, manifest.Version)
		return nil
	}

	key := PlatformKey()
	platform, ok := manifest.Platforms[key]
	if !ok {
		return fmt.Errorf("no release for platform %s", key)
	}

	state := &UpdateState{
		Version:    manifest.Version,
		ArchiveURL: buildinfo.BaseURL + "/build/" + platform.Archive,
		SHA256:     platform.SHA256,
		CheckedAt:  time.Now().UTC(),
	}

	debug.Log("update: newer version %s available, writing state file", manifest.Version)
	return writeUpdateState(state)
}

// ApplyUpdate reads the state file, downloads the archive, verifies, extracts,
// and replaces the binary. Returns the new version string on success.
// Clears the state file regardless of outcome so we don't retry broken updates forever.
func ApplyUpdate(client *http.Client) (string, error) {
	state, err := ReadUpdateState()
	if err != nil {
		clearUpdateState()
		return "", err
	}
	if state == nil {
		return "", nil
	}

	// Clear state file up front so a failed update doesn't retry forever.
	// The next run will do a fresh CheckForUpdate instead.
	clearUpdateState()

	debug.Log("update: applying update to v%s", state.Version)

	data, err := downloadFile(client, state.ArchiveURL)
	if err != nil {
		return "", err
	}

	if err := verifyChecksum(data, state.SHA256); err != nil {
		return "", err
	}

	binaryName := buildinfo.AppName
	if runtime.GOOS == "windows" {
		binaryName += ".exe"
	}

	var binaryData []byte
	if strings.HasSuffix(state.ArchiveURL, ".zip") {
		binaryData, err = extractFromZip(data, binaryName)
	} else {
		binaryData, err = extractFromTarGz(data, binaryName)
	}
	if err != nil {
		return "", err
	}

	if err := replaceBinary(binaryData); err != nil {
		return "", err
	}

	debug.Log("update: updated to v%s", state.Version)
	return state.Version, nil
}

// ShouldCheckForUpdate reports whether the update check should run.
func ShouldCheckForUpdate() bool {
	bi := buildinfo.GetBuildInfo()
	if bi == nil {
		return false
	}

	// Skip local dev builds (go run / go build without ldflags)
	if bi.Version == "development" {
		debug.Log("update: skipping (local dev build)")
		return false
	}

	// Skip in CI environments
	ciVars := []string{
		"CI", "GITHUB_ACTIONS", "GITLAB_CI", "CIRCLECI",
		"TRAVIS", "JENKINS_URL", "BUILDKITE", "TF_BUILD",
	}
	for _, v := range ciVars {
		if os.Getenv(v) != "" {
			debug.Log("update: skipping (CI detected via %s)", v)
			return false
		}
	}

	return true
}

func downloadFile(client *http.Client, url string) ([]byte, error) {
	resp, err := client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("downloading %s: %w", url, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("download returned HTTP %d", resp.StatusCode)
	}

	const maxUpdateSize = 50 * 1024 * 1024 // 50MB
	data, err := io.ReadAll(io.LimitReader(resp.Body, maxUpdateSize))
	if err != nil {
		return nil, fmt.Errorf("reading download body: %w", err)
	}
	return data, nil
}

func verifyChecksum(data []byte, expected string) error {
	h := sha256.Sum256(data)
	actual := hex.EncodeToString(h[:])
	if actual != expected {
		return fmt.Errorf("checksum mismatch: got %s, want %s", actual, expected)
	}
	debug.Log("update: checksum verified")
	return nil
}

func extractFromTarGz(data []byte, binaryName string) ([]byte, error) {
	gz, err := gzip.NewReader(bytes.NewReader(data))
	if err != nil {
		return nil, fmt.Errorf("opening gzip: %w", err)
	}
	defer gz.Close()

	tr := tar.NewReader(gz)
	for {
		hdr, err := tr.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("reading tar: %w", err)
		}
		if filepath.Base(hdr.Name) == binaryName && hdr.Typeflag == tar.TypeReg {
			content, err := io.ReadAll(tr)
			if err != nil {
				return nil, fmt.Errorf("reading %s from tar: %w", binaryName, err)
			}
			return content, nil
		}
	}
	return nil, fmt.Errorf("%s not found in archive", binaryName)
}

func extractFromZip(data []byte, binaryName string) ([]byte, error) {
	r, err := zip.NewReader(bytes.NewReader(data), int64(len(data)))
	if err != nil {
		return nil, fmt.Errorf("opening zip: %w", err)
	}
	for _, f := range r.File {
		if filepath.Base(f.Name) == binaryName {
			rc, err := f.Open()
			if err != nil {
				return nil, fmt.Errorf("opening %s in zip: %w", binaryName, err)
			}
			defer rc.Close()
			content, err := io.ReadAll(rc)
			if err != nil {
				return nil, fmt.Errorf("reading %s from zip: %w", binaryName, err)
			}
			return content, nil
		}
	}
	return nil, fmt.Errorf("%s not found in archive", binaryName)
}

// replaceBinary atomically replaces the current executable with newBinary.
func replaceBinary(newBinary []byte) error {
	exe, err := executablePath()
	if err != nil {
		return fmt.Errorf("finding current executable: %w", err)
	}
	exe, err = filepath.EvalSymlinks(exe)
	if err != nil {
		return fmt.Errorf("resolving symlinks: %w", err)
	}
	return replaceBinaryAt(newBinary, exe)
}

// replaceBinaryAt atomically replaces the binary at destPath with newBinary.
func replaceBinaryAt(newBinary []byte, destPath string) error {
	dir := filepath.Dir(destPath)
	base := filepath.Base(destPath)

	// Write new binary to a temp file in the same directory (same filesystem for rename)
	tmp, err := os.CreateTemp(dir, base+".new.*")
	if err != nil {
		return fmt.Errorf("creating temp file: %w", err)
	}
	tmpPath := tmp.Name()

	if _, err := tmp.Write(newBinary); err != nil {
		tmp.Close()
		os.Remove(tmpPath)
		return fmt.Errorf("writing new binary: %w", err)
	}
	if err := tmp.Chmod(0o755); err != nil {
		tmp.Close()
		os.Remove(tmpPath)
		return fmt.Errorf("setting permissions: %w", err)
	}
	if err := tmp.Close(); err != nil {
		os.Remove(tmpPath)
		return fmt.Errorf("closing temp file: %w", err)
	}

	// Rename current binary to .bak, then new to current
	bakPath := destPath + ".bak"
	_ = os.Remove(bakPath) // clean up any leftover .bak

	if err := os.Rename(destPath, bakPath); err != nil {
		os.Remove(tmpPath)
		return fmt.Errorf("backing up current binary: %w", err)
	}

	if err := os.Rename(tmpPath, destPath); err != nil {
		// Try to restore the backup
		_ = os.Rename(bakPath, destPath)
		os.Remove(tmpPath)
		return fmt.Errorf("replacing binary: %w", err)
	}

	// Clean up backup
	_ = os.Remove(bakPath)

	return nil
}
