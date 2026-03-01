package update

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"runtime"

	"github.com/deepsourcelabs/cli/buildinfo"
)

// Manifest represents the CLI release manifest served by the CDN.
type Manifest struct {
	Version   string                  `json:"version"`
	BuildTime string                  `json:"buildTime"`
	Platforms map[string]PlatformInfo `json:"platforms"`
}

// PlatformInfo holds the archive filename and checksum for a platform.
type PlatformInfo struct {
	Archive string `json:"archive"`
	SHA256  string `json:"sha256"`
}

// FetchManifest downloads and parses the release manifest.
func FetchManifest(client *http.Client) (*Manifest, error) {
	resp, err := client.Get(buildinfo.BaseURL + "/manifest.json")
	if err != nil {
		return nil, fmt.Errorf("fetching manifest: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("manifest returned HTTP %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("reading manifest body: %w", err)
	}

	var m Manifest
	if err := json.Unmarshal(body, &m); err != nil {
		return nil, fmt.Errorf("parsing manifest JSON: %w", err)
	}
	return &m, nil
}

// PlatformKey returns the manifest key for the current OS/arch.
func PlatformKey() string {
	return runtime.GOOS + "_" + runtime.GOARCH
}
