package buildinfo

import (
	"fmt"
	"time"
)

var buildInfo *BuildInfo

// App identity variables. Defaults are prod values; overridden in main.go for dev builds.
var (
	AppName       = "deepsource"              // binary name / display name
	ConfigDirName = ".deepsource"             // ~/<this>/
	BaseURL       = "https://cli.deepsource.com" // CDN base for manifest and archives
)

// BuildInfo describes the compile time information.
type BuildInfo struct {
	// Version is the current semver.
	Version string `json:"version,omitempty"`
	// Date is the build date.
	Date time.Time `json:"date,omitempty"`
	// BuildMode is "dev" or "prod".
	BuildMode string `json:"build_mode,omitempty"`
}

func SetBuildInfo(version, dateStr, buildMode string) {
	date, _ := time.Parse("2006-01-02T15:04:05Z", dateStr)

	buildInfo = &BuildInfo{
		Version:   version,
		Date:      date,
		BuildMode: buildMode,
	}
}

func GetBuildInfo() *BuildInfo {
	return buildInfo
}

func (bi BuildInfo) String() string {
	s := fmt.Sprintf("Version:    v%s", bi.Version)
	if bi.BuildMode == "dev" && !bi.Date.IsZero() {
		s += fmt.Sprintf("\nBuild Time: %s", bi.Date.Format(time.RFC3339))
	}
	return s
}
