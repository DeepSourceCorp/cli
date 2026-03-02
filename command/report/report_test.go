package report

import "testing"

func TestReportSkipVerifyFlagExists(t *testing.T) {
	cmd := NewCmdReport()
	f := cmd.Flags().Lookup("skip-verify")
	if f == nil {
		t.Fatal("expected skip-verify flag on report command, got nil")
	}
}

func TestReportSkipVerifyFlagDeprecated(t *testing.T) {
	cmd := NewCmdReport()
	f := cmd.Flags().Lookup("skip-verify")
	if f == nil {
		t.Fatal("expected skip-verify flag on report command, got nil")
	}
	if f.Deprecated == "" {
		t.Error("expected skip-verify flag to be marked as deprecated")
	}
}
