package style

import (
	"bytes"
	"strings"
	"testing"
)

func TestCapitalize(t *testing.T) {
	tests := []struct {
		in, want string
	}{
		{"", ""},
		{"hello", "Hello"},
		{"Hello", "Hello"},
		{"über", "Über"},
		{"a", "A"},
	}
	for _, tt := range tests {
		if got := capitalize(tt.in); got != tt.want {
			t.Errorf("capitalize(%q) = %q, want %q", tt.in, got, tt.want)
		}
	}
}

func TestErrorf(t *testing.T) {
	var buf bytes.Buffer
	Errorf(&buf, "something %s", "broke")
	out := buf.String()
	if !strings.Contains(out, "Error:") {
		t.Errorf("expected 'Error:' prefix, got %q", out)
	}
	if !strings.Contains(out, "Something broke") {
		t.Errorf("expected capitalized message 'Something broke', got %q", out)
	}
}

func TestInfof(t *testing.T) {
	var buf bytes.Buffer
	Infof(&buf, "check your %s", "config")
	out := buf.String()
	if !strings.Contains(out, "Note:") {
		t.Errorf("expected 'Note:' prefix, got %q", out)
	}
	if !strings.Contains(out, "Check your config") {
		t.Errorf("expected capitalized message, got %q", out)
	}
}

func TestWarnf(t *testing.T) {
	var buf bytes.Buffer
	Warnf(&buf, "deprecated %s", "flag")
	out := buf.String()
	if !strings.Contains(out, "Warning:") {
		t.Errorf("expected 'Warning:' prefix, got %q", out)
	}
	if !strings.Contains(out, "Deprecated flag") {
		t.Errorf("expected capitalized message, got %q", out)
	}
}

func TestSuccessf(t *testing.T) {
	var buf bytes.Buffer
	Successf(&buf, "upload %s", "complete")
	out := buf.String()
	if !strings.Contains(out, "Success:") {
		t.Errorf("expected 'Success:' prefix, got %q", out)
	}
	if !strings.Contains(out, "Upload complete") {
		t.Errorf("expected capitalized message, got %q", out)
	}
}

func TestIssueSeverityColor(t *testing.T) {
	// Known severities return non-empty (colored) strings
	for _, sev := range []string{"CRITICAL", "MAJOR", "MINOR"} {
		if got := IssueSeverityColor(sev, "text"); got == "" {
			t.Errorf("IssueSeverityColor(%q) returned empty", sev)
		}
	}
	// Case-insensitive
	if got := IssueSeverityColor("critical", "text"); got == "" {
		t.Error("expected case-insensitive match for 'critical'")
	}
	// Unknown returns plain text
	if got := IssueSeverityColor("UNKNOWN", "text"); got != "text" {
		t.Errorf("expected plain 'text' for unknown severity, got %q", got)
	}
}

func TestVulnSeverityColor(t *testing.T) {
	for _, sev := range []string{"CRITICAL", "HIGH", "MEDIUM", "LOW"} {
		if got := VulnSeverityColor(sev, "vuln"); got == "" {
			t.Errorf("VulnSeverityColor(%q) returned empty", sev)
		}
	}
	if got := VulnSeverityColor("UNKNOWN", "vuln"); got != "vuln" {
		t.Errorf("expected plain 'vuln' for unknown, got %q", got)
	}
}

func TestGradeColor(t *testing.T) {
	// All known grades return non-empty strings
	for _, grade := range []string{"A+", "B", "C-", "D", "F"} {
		if got := GradeColor(grade); got == "" {
			t.Errorf("GradeColor(%q) returned empty", grade)
		}
	}
}

func TestRunStatusColor(t *testing.T) {
	tests := []struct {
		status, contains string
	}{
		{"SUCCESS", "Success"},
		{"FAILURE", "Failure"},
		{"PENDING", "Pending"},
		{"RUNNING", "Running"},
	}
	for _, tt := range tests {
		got := RunStatusColor(tt.status)
		if !strings.Contains(got, tt.contains) {
			t.Errorf("RunStatusColor(%q) = %q, expected to contain %q", tt.status, got, tt.contains)
		}
	}
	// Unknown returns input as-is
	if got := RunStatusColor("CANCELLED"); got != "CANCELLED" {
		t.Errorf("RunStatusColor(CANCELLED) = %q, want %q", got, "CANCELLED")
	}
}

func TestPluralize(t *testing.T) {
	tests := []struct {
		count    int
		singular string
		plural   string
		want     string
	}{
		{0, "issue", "issues", "issues"},
		{1, "issue", "issues", "issue"},
		{2, "issue", "issues", "issues"},
		{100, "file", "files", "files"},
	}
	for _, tt := range tests {
		if got := Pluralize(tt.count, tt.singular, tt.plural); got != tt.want {
			t.Errorf("Pluralize(%d, %q, %q) = %q, want %q", tt.count, tt.singular, tt.plural, got, tt.want)
		}
	}
}
