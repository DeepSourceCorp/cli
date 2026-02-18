package tests

import (
	"strings"
	"testing"

	"github.com/deepsourcelabs/cli/command/cmddeps"
	logoutCmd "github.com/deepsourcelabs/cli/command/auth/logout"
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

	if !strings.Contains(err.Error(), "not logged into DeepSource") {
		t.Errorf("expected error to contain %q, got %q", "not logged into DeepSource", err.Error())
	}
}
