package cmdutil

import (
	"testing"

	"github.com/deepsourcelabs/cli/deepsource/runs"
)

// TestFormatCategory verifies all known category codes are converted correctly.
func TestFormatCategory(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"BUG_RISK", "Bug Risk"},
		{"ANTI_PATTERN", "Anti Pattern"},
		{"SECURITY", "Security"},
		{"PERFORMANCE", "Performance"},
		{"COVERAGE", "Coverage"},
		{"TYPECHECK", "Typecheck"},
		{"STYLE", "Style"},
		{"DOCUMENTATION", "Documentation"},
		{"COMPLEXITY", "Complexity"},
		{"UNKNOWN_TYPE", "Unknown Type"},
		{"", ""},
	}
	for _, tt := range tests {
		got := FormatCategory(tt.input)
		if got != tt.want {
			t.Errorf("FormatCategory(%q) = %q, want %q", tt.input, got, tt.want)
		}
	}
}

// TestToReportCardJSON_Nil verifies nil input returns nil.
func TestToReportCardJSON_Nil(t *testing.T) {
	if got := ToReportCardJSON(nil); got != nil {
		t.Errorf("expected nil, got %+v", got)
	}
}

func buildFullReportCard() *runs.ReportCard {
	lineCov := 82.4
	branchCov := 71.0
	score := 88

	return &runs.ReportCard{
		Status:      "READY",
		Security:    &runs.ReportDimension{Grade: "A+", Score: 99, IssuesCount: 0},
		Reliability: &runs.ReportDimension{Grade: "A", Score: 94, IssuesCount: 3},
		Complexity:  &runs.ReportDimension{Grade: "B+", Score: 87, IssuesCount: 4},
		Hygiene:     &runs.ReportDimension{Grade: "A", Score: 91, IssuesCount: 2},
		Coverage: &runs.ReportCoverage{
			Grade:          "B+",
			Score:          &score,
			LineCoverage:   &lineCov,
			BranchCoverage: &branchCov,
		},
		Aggregate: &runs.ReportAggregate{Grade: "A", Score: 93},
		FocusArea: &runs.ReportFocusArea{Dimension: "COMPLEXITY", Action: "Reduce cyclomatic complexity"},
	}
}

// TestToReportCardJSON_AllFields verifies a fully-populated ReportCard converts correctly.
func TestToReportCardJSON_AllFields(t *testing.T) {
	rc := buildFullReportCard()
	got := ToReportCardJSON(rc)
	if got == nil {
		t.Fatal("expected non-nil result")
	}

	checks := []struct {
		name string
		ok   bool
		detail interface{}
	}{
		{"Status", got.Status == "READY", got.Status},
		{"Security", got.Security != nil && got.Security.Grade == "A+" && got.Security.Score == 99 && got.Security.IssuesCount == 0, got.Security},
		{"Reliability", got.Reliability != nil && got.Reliability.Grade == "A", got.Reliability},
		{"Complexity", got.Complexity != nil && got.Complexity.Score == 87, got.Complexity},
		{"Hygiene", got.Hygiene != nil && got.Hygiene.IssuesCount == 2, got.Hygiene},
		{"Coverage.Grade", got.Coverage != nil && got.Coverage.Grade == "B+", got.Coverage},
		{"Coverage.LineCoverage", got.Coverage != nil && got.Coverage.LineCoverage != nil && *got.Coverage.LineCoverage == 82.4, got.Coverage},
		{"Coverage.BranchCoverage", got.Coverage != nil && got.Coverage.BranchCoverage != nil && *got.Coverage.BranchCoverage == 71.0, got.Coverage},
		{"Aggregate", got.Aggregate != nil && got.Aggregate.Grade == "A" && got.Aggregate.Score == 93, got.Aggregate},
		{"FocusArea", got.FocusArea != nil && got.FocusArea.Dimension == "COMPLEXITY", got.FocusArea},
	}
	for _, c := range checks {
		if !c.ok {
			t.Errorf("%s mismatch: %+v", c.name, c.detail)
		}
	}
}

// TestToReportCardJSON_PartialFields verifies nil dimensions are omitted from output.
func TestToReportCardJSON_PartialFields(t *testing.T) {
	rc := &runs.ReportCard{
		Status:   "READY",
		Security: &runs.ReportDimension{Grade: "A", Score: 95, IssuesCount: 1},
		Aggregate: &runs.ReportAggregate{Grade: "A", Score: 90},
	}

	got := ToReportCardJSON(rc)
	if got == nil {
		t.Fatal("expected non-nil result")
	}

	if got.Security == nil {
		t.Error("Security should be set")
	}
	if got.Aggregate == nil {
		t.Error("Aggregate should be set")
	}
	// Unset dimensions must be nil (omitempty in JSON)
	if got.Reliability != nil {
		t.Errorf("Reliability should be nil, got %+v", got.Reliability)
	}
	if got.Complexity != nil {
		t.Errorf("Complexity should be nil, got %+v", got.Complexity)
	}
	if got.Hygiene != nil {
		t.Errorf("Hygiene should be nil, got %+v", got.Hygiene)
	}
	if got.Coverage != nil {
		t.Errorf("Coverage should be nil, got %+v", got.Coverage)
	}
	if got.FocusArea != nil {
		t.Errorf("FocusArea should be nil, got %+v", got.FocusArea)
	}
}
