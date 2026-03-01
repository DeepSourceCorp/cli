package update

import (
	"archive/tar"
	"archive/zip"
	"bytes"
	"compress/gzip"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/deepsourcelabs/cli/buildinfo"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/internal/debug"
)

// Update checks for a newer CLI version and replaces the current binary.
// Returns the new version string if an update was applied, or "" if already
// up to date. Errors are non-fatal — callers should log and move on.
func Update(client *http.Client) (string, error) {
	bi := buildinfo.GetBuildInfo()
	if bi == nil {
		return "", fmt.Errorf("build info not set")
	}

	manifest, err := FetchManifest(client)
	if err != nil {
		return "", err
	}

	newer, err := IsNewer(bi.Version, manifest.Version)
	if err != nil {
		return "", err
	}
	if !newer {
		debug.Log("update: already up to date (current=%s, remote=%s)", bi.Version, manifest.Version)
		return "", nil
	}

	key := PlatformKey()
	platform, ok := manifest.Platforms[key]
	if !ok {
		return "", fmt.Errorf("no release for platform %s", key)
	}

	debug.Log("update: downloading %s", platform.Archive)

	archiveURL := "https://cli.deepsource.com/" + platform.Archive
	data, err := downloadFile(client, archiveURL)
	if err != nil {
		return "", err
	}

	if err := verifyChecksum(data, platform.SHA256); err != nil {
		return "", err
	}

	binaryName := buildinfo.AppName
	if runtime.GOOS == "windows" {
		binaryName += ".exe"
	}

	var binaryData []byte
	if strings.HasSuffix(platform.Archive, ".zip") {
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

	debug.Log("update: updated to v%s", manifest.Version)
	return manifest.Version, nil
}

// ShouldAutoUpdate reports whether the auto-updater should run.
func ShouldAutoUpdate() bool {
	bi := buildinfo.GetBuildInfo()
	if bi == nil {
		return false
	}

	// Skip in dev mode
	if bi.BuildMode == "dev" || bi.Version == "development" {
		debug.Log("update: skipping (dev build)")
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

	// Check config
	cfg, err := config.GetConfig()
	if err == nil && cfg.AutoUpdate != nil && !*cfg.AutoUpdate {
		debug.Log("update: skipping (disabled in config)")
		return false
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

	data, err := io.ReadAll(resp.Body)
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
	exe, err := os.Executable()
	if err != nil {
		return fmt.Errorf("finding current executable: %w", err)
	}
	exe, err = filepath.EvalSymlinks(exe)
	if err != nil {
		return fmt.Errorf("resolving symlinks: %w", err)
	}

	dir := filepath.Dir(exe)
	base := filepath.Base(exe)

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
	bakPath := exe + ".bak"
	_ = os.Remove(bakPath) // clean up any leftover .bak

	if err := os.Rename(exe, bakPath); err != nil {
		os.Remove(tmpPath)
		return fmt.Errorf("backing up current binary: %w", err)
	}

	if err := os.Rename(tmpPath, exe); err != nil {
		// Try to restore the backup
		_ = os.Rename(bakPath, exe)
		os.Remove(tmpPath)
		return fmt.Errorf("replacing binary: %w", err)
	}

	// Clean up backup
	_ = os.Remove(bakPath)

	return nil
}
