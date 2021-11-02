package version

import (
	"fmt"
	"time"
)

var buildInfo *BuildInfo

// BuildInfo describes the compile time information.
type BuildInfo struct {
	// Version is the current semver.
	Version string `json:"version,omitempty"`
	// Date is the build date.
	Date time.Time `json:"date,omitempty"`
	// gitTreeState is the state of the git tree.
	GitTreeState string `json:"git_tree_state,omitempty"`
	// GitCommit is the git sha1.
	GitCommit string `json:"git_commit,omitempty"`
}

// Set's the build info as a package global.
func SetBuildInfo(version, dateStr, gitTreeState, gitCommit string) {
	date, _ := time.Parse("2006-01-02", dateStr)

	buildInfo = &BuildInfo{
		Version:      version,
		Date:         date,
		GitTreeState: gitTreeState,
		GitCommit:    gitCommit,
	}
}

// GetBuildInfo returns the package global `buildInfo`
func GetBuildInfo() *BuildInfo {
	return buildInfo
}

func (bi BuildInfo) String() string {
	if bi.Date.IsZero() {
		return fmt.Sprintf("DeepSource CLI version %s", bi.Version)
	}
	dateStr := bi.Date.Format("2006-01-02")
	return fmt.Sprintf("DeepSource CLI version %s (%s)", bi.Version, dateStr)
}
