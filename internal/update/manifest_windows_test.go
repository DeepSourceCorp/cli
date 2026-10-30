//go:build windows

package update

import (
	"runtime"
	"testing"
)

func TestWindowsPlatformKey(t *testing.T) {
	expected := map[string]string{
		"amd64": "windows_amd64",
		"arm64": "windows_arm64",
	}

	want, ok := expected[runtime.GOARCH]
	if !ok {
		t.Skipf("no Windows release artifact for GOARCH=%s", runtime.GOARCH)
	}
	if got := PlatformKey(); got != want {
		t.Fatalf("PlatformKey() = %q, want %q", got, want)
	}
}
