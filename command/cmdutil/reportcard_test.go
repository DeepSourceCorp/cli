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

func assertDimension(t *testing.T, name string, dim *ReportDimensionJSON, wantGrade string, wantScore int, wantIssues int) {
	t.Helper()
	if dim == nil {
		t.Fatalf("%s: expected non-nil", name)
		return
	}
	if dim.Grade != wantGrade {
		t.Errorf("%s.Grade = %q, want %q", name, dim.Grade, wantGrade)
	}
	if dim.Score != wantScore {
		t.Errorf("%s.Score = %d, want %d", name, dim.Score, wantScore)
	}
	if dim.IssuesCount != wantIssues {
		t.Errorf("%s.IssuesCount = %d, want %d", name, dim.IssuesCount, wantIssues)
	}
}

func assertCoverage(t *testing.T, cov *ReportCoverageJSON, wantGrade string, wantLine float64, wantBranch float64) {
	t.Helper()
	if cov == nil {
		t.Fatal("Coverage: expected non-nil")
		return
	}
	if cov.Grade != wantGrade {
		t.Errorf("Coverage.Grade = %q, want %q", cov.Grade, wantGrade)
	}
	if cov.LineCoverage == nil {
		t.Error("Coverage.LineCoverage: expected non-nil")
	} else if *cov.LineCoverage != wantLine {
		t.Errorf("Coverage.LineCoverage = %v, want %v", *cov.LineCoverage, wantLine)
	}
	if cov.BranchCoverage == nil {
		t.Error("Coverage.BranchCoverage: expected non-nil")
	} else if *cov.BranchCoverage != wantBranch {
		t.Errorf("Coverage.BranchCoverage = %v, want %v", *cov.BranchCoverage, wantBranch)
	}
}

// TestToReportCardJSON_AllFields verifies a fully-populated ReportCard converts correctly.
func TestToReportCardJSON_AllFields(t *testing.T) {
	rc := buildFullReportCard()
	got := ToReportCardJSON(rc)
	if got == nil {
		t.Fatal("expected non-nil result")
	}

	if got.Status != "READY" {
		t.Errorf("Status = %q, want %q", got.Status, "READY")
	}

	assertDimension(t, "Security", got.Security, "A+", 99, 0)
	assertDimension(t, "Reliability", got.Reliability, "A", 94, 3)
	assertDimension(t, "Complexity", got.Complexity, "B+", 87, 4)
	assertDimension(t, "Hygiene", got.Hygiene, "A", 91, 2)
	assertCoverage(t, got.Coverage, "B+", 82.4, 71.0)

	if got.Aggregate == nil {
		t.Fatal("Aggregate: expected non-nil")
	}
	if got.Aggregate.Grade != "A" || got.Aggregate.Score != 93 {
		t.Errorf("Aggregate = {%q, %d}, want {\"A\", 93}", got.Aggregate.Grade, got.Aggregate.Score)
	}

	if got.FocusArea == nil {
		t.Fatal("FocusArea: expected non-nil")
	}
	if got.FocusArea.Dimension != "COMPLEXITY" {
		t.Errorf("FocusArea.Dimension = %q, want %q", got.FocusArea.Dimension, "COMPLEXITY")
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
