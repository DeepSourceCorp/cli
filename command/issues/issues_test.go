package issues

import (
	"testing"

	"github.com/deepsourcelabs/cli/deepsource/issues"
)

func TestNormalizeEnumValue(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"bug-risk", "BUG_RISK"},
		{"anti-pattern", "ANTI_PATTERN"},
		{"security", "SECURITY"},
		{"critical", "CRITICAL"},
		{" bug-risk ", "BUG_RISK"},
		{"ANTI-PATTERN", "ANTI_PATTERN"},
		{"ai", "AI"},
		{"static", "STATIC"},
	}
	for _, tt := range tests {
		got := normalizeEnumValue(tt.input)
		if got != tt.want {
			t.Errorf("normalizeEnumValue(%q) = %q, want %q", tt.input, got, tt.want)
		}
	}
}

func TestFormatLineRange(t *testing.T) {
	tests := []struct {
		pos  issues.Position
		want string
	}{
		{issues.Position{BeginLine: 42, EndLine: 42}, "42"},
		{issues.Position{BeginLine: 42, EndLine: 96}, "42-96"},
		{issues.Position{BeginLine: 1, EndLine: 1}, "1"},
	}
	for _, tt := range tests {
		got := formatLineRange(tt.pos)
		if got != tt.want {
			t.Errorf("formatLineRange(%+v) = %q, want %q", tt.pos, got, tt.want)
		}
	}
}

func TestGroupIdenticalIssues(t *testing.T) {
	input := []issues.Issue{
		{IssueText: "Lines not covered", IssueSeverity: "CRITICAL", IssueCode: "COV-001", Location: issues.Location{Path: "a.go"}},
		{IssueText: "Unused variable", IssueSeverity: "MAJOR", IssueCode: "GO-W1007", Location: issues.Location{Path: "b.go"}},
		{IssueText: "Lines not covered", IssueSeverity: "CRITICAL", IssueCode: "COV-001", Location: issues.Location{Path: "c.go"}},
		{IssueText: "Lines not covered", IssueSeverity: "CRITICAL", IssueCode: "COV-001", Location: issues.Location{Path: "d.go"}},
	}

	groups := groupIdenticalIssues(input)

	if len(groups) != 2 {
		t.Fatalf("expected 2 groups, got %d", len(groups))
	}

	// First group: "Lines not covered" with 3 occurrences
	if groups[0].Key.IssueText != "Lines not covered" {
		t.Errorf("group[0] text = %q, want %q", groups[0].Key.IssueText, "Lines not covered")
	}
	if len(groups[0].Issues) != 3 {
		t.Errorf("group[0] count = %d, want 3", len(groups[0].Issues))
	}

	// Second group: "Unused variable" with 1 occurrence
	if groups[1].Key.IssueText != "Unused variable" {
		t.Errorf("group[1] text = %q, want %q", groups[1].Key.IssueText, "Unused variable")
	}
	if len(groups[1].Issues) != 1 {
		t.Errorf("group[1] count = %d, want 1", len(groups[1].Issues))
	}
}

func TestGroupIdenticalIssues_DifferentSeverity(t *testing.T) {
	// Same text and code but different severity should be separate groups
	input := []issues.Issue{
		{IssueText: "Lines not covered", IssueSeverity: "CRITICAL", IssueCode: "COV-001"},
		{IssueText: "Lines not covered", IssueSeverity: "MAJOR", IssueCode: "COV-001"},
	}

	groups := groupIdenticalIssues(input)
	if len(groups) != 2 {
		t.Fatalf("expected 2 groups for different severities, got %d", len(groups))
	}
}

func TestFormatGroupLocations(t *testing.T) {
	input := []issues.Issue{
		{Location: issues.Location{Path: "command/root.go", Position: issues.Position{BeginLine: 23, EndLine: 39}}},
		{Location: issues.Location{Path: "command/root.go", Position: issues.Position{BeginLine: 42, EndLine: 96}}},
		{Location: issues.Location{Path: "command/root.go", Position: issues.Position{BeginLine: 155, EndLine: 155}}},
		{Location: issues.Location{Path: "internal/vcs/remotes.go", Position: issues.Position{BeginLine: 10, EndLine: 20}}},
	}

	result := formatGroupLocations(input, "")

	if len(result) != 2 {
		t.Fatalf("expected 2 file entries, got %d", len(result))
	}

	if result[0] != "command/root.go:23-39, 42-96, 155" {
		t.Errorf("result[0] = %q, want %q", result[0], "command/root.go:23-39, 42-96, 155")
	}
	if result[1] != "internal/vcs/remotes.go:10-20" {
		t.Errorf("result[1] = %q, want %q", result[1], "internal/vcs/remotes.go:10-20")
	}
}

func TestFormatGroupLocations_CwdStripped(t *testing.T) {
	input := []issues.Issue{
		{Location: issues.Location{Path: "/home/user/project/cmd/main.go", Position: issues.Position{BeginLine: 5, EndLine: 5}}},
	}

	result := formatGroupLocations(input, "/home/user/project")

	if len(result) != 1 {
		t.Fatalf("expected 1 entry, got %d", len(result))
	}
	if result[0] != "cmd/main.go:5" {
		t.Errorf("result[0] = %q, want %q", result[0], "cmd/main.go:5")
	}
}
