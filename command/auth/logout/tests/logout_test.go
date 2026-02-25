package tests

import (
	"strings"
	"testing"

	logoutCmd "github.com/deepsourcelabs/cli/command/auth/logout"
	"github.com/deepsourcelabs/cli/command/cmddeps"
	"github.com/deepsourcelabs/cli/internal/testutil"
)

func TestLogoutNotLoggedIn(t *testing.T) {
	// Empty token → user is not logged in
	cfgMgr := testutil.CreateExpiredTestConfigManager(t, "", "deepsource.com", "")

	deps := &cmddeps.Deps{
		ConfigMgr: cfgMgr,
	}

	cmd := logoutCmd.NewCmdLogoutWithDeps(deps)
	cmd.SetArgs([]string{})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error when not logged in, got nil")
	}

	if !strings.Contains(err.Error(), "Not logged in") {
		t.Errorf("expected error to contain %q, got %q", "Not logged in", err.Error())
	}
}

func TestLogoutSuccess(t *testing.T) {
	cfgMgr := testutil.CreateTestConfigManager(t, "test-token", "deepsource.com", "user@example.com")

	var buf strings.Builder
	deps := &cmddeps.Deps{
		ConfigMgr: cfgMgr,
		Stdout:    &buf,
	}

	opts := logoutCmd.NewLogoutOptionsForTest(deps, func(_, _ string) (bool, error) { return true, nil })

	if err := opts.Run(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(buf.String(), "Logged out from DeepSource") {
		t.Errorf("expected logout message, got: %q", buf.String())
	}
}
