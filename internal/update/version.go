package update

import (
	"fmt"
	"strconv"
	"strings"
)

// IsNewer reports whether remote is a newer semver than current.
// Both values may optionally have a "v" prefix (e.g. "v2.0.3").
func IsNewer(current, remote string) (bool, error) {
	curMaj, curMin, curPatch, err := parseSemver(current)
	if err != nil {
		return false, fmt.Errorf("parsing current version %q: %w", current, err)
	}
	remMaj, remMin, remPatch, err := parseSemver(remote)
	if err != nil {
		return false, fmt.Errorf("parsing remote version %q: %w", remote, err)
	}

	if remMaj != curMaj {
		return remMaj > curMaj, nil
	}
	if remMin != curMin {
		return remMin > curMin, nil
	}
	return remPatch > curPatch, nil
}

func parseSemver(v string) (major, minor, patch int, err error) {
	v = strings.TrimPrefix(v, "v")
	parts := strings.SplitN(v, ".", 3)
	if len(parts) != 3 {
		return 0, 0, 0, fmt.Errorf("expected X.Y.Z, got %q", v)
	}
	major, err = strconv.Atoi(parts[0])
	if err != nil {
		return 0, 0, 0, err
	}
	minor, err = strconv.Atoi(parts[1])
	if err != nil {
		return 0, 0, 0, err
	}
	// Strip pre-release or build metadata suffix (e.g. "44-e888cf0f" → "44")
	patchStr, _, _ := strings.Cut(parts[2], "-")
	patch, err = strconv.Atoi(patchStr)
	if err != nil {
		return 0, 0, 0, err
	}
	return major, minor, patch, nil
}
