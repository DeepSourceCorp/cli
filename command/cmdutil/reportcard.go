package cmdutil

import (
	"fmt"
	"io"
	"strings"

	"github.com/deepsourcelabs/cli/deepsource/runs"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	"github.com/pterm/pterm"
)

// ShowReportCard renders a report card as a pterm table.
func ShowReportCard(w io.Writer, rc *runs.ReportCard) {
	if rc == nil {
		return
	}

	fmt.Fprintln(w)

	header := []string{"Dimension", "Grade", "Score", "Issues"}
	data := [][]string{header}

	if rc.Security != nil {
		data = append(data, []string{"Security", style.GradeColor(rc.Security.Grade), fmt.Sprintf("%d", rc.Security.Score), fmt.Sprintf("%d", rc.Security.IssuesCount)})
	}
	if rc.Reliability != nil {
		data = append(data, []string{"Reliability", style.GradeColor(rc.Reliability.Grade), fmt.Sprintf("%d", rc.Reliability.Score), fmt.Sprintf("%d", rc.Reliability.IssuesCount)})
	}
	if rc.Complexity != nil {
		data = append(data, []string{"Complexity", style.GradeColor(rc.Complexity.Grade), fmt.Sprintf("%d", rc.Complexity.Score), fmt.Sprintf("%d", rc.Complexity.IssuesCount)})
	}
	if rc.Hygiene != nil {
		data = append(data, []string{"Hygiene", style.GradeColor(rc.Hygiene.Grade), fmt.Sprintf("%d", rc.Hygiene.Score), fmt.Sprintf("%d", rc.Hygiene.IssuesCount)})
	}
	pterm.DefaultTable.WithHasHeader().WithData(data).Render()

	if rc.Coverage != nil {
		var coverageParts []string
		coverageParts = append(coverageParts, fmt.Sprintf("Grade: %s", style.GradeColor(rc.Coverage.Grade)))
		if rc.Coverage.LineCoverage != nil {
			coverageParts = append(coverageParts, fmt.Sprintf("Line: %.1f%%", *rc.Coverage.LineCoverage))
		}
		if rc.Coverage.BranchCoverage != nil {
			coverageParts = append(coverageParts, fmt.Sprintf("Branch: %.1f%%", *rc.Coverage.BranchCoverage))
		}
		fmt.Fprintf(w, "%s %s\n", pterm.Bold.Sprint("Coverage:"), strings.Join(coverageParts, "  |  "))
	}

	if rc.Aggregate != nil {
		fmt.Fprintf(w, "%s %s (score: %d)\n", pterm.Bold.Sprint("Aggregate:"), style.GradeColor(rc.Aggregate.Grade), rc.Aggregate.Score)
	}

	if rc.FocusArea != nil && rc.FocusArea.Dimension != "" {
		fmt.Fprintf(w, "%s %s — %s\n", pterm.Bold.Sprint("Focus Area:"), FormatCategory(rc.FocusArea.Dimension), rc.FocusArea.Action)
	}
}

// FormatCategory converts "BUG_RISK" to "Bug Risk", "SECURITY" to "Security", etc.
func FormatCategory(s string) string {
	parts := strings.Split(strings.ToLower(s), "_")
	for i, p := range parts {
		if p != "" {
			parts[i] = strings.ToUpper(p[:1]) + p[1:]
		}
	}
	return strings.Join(parts, " ")
}

// --- JSON types for report card output ---

type ReportCardJSON struct {
	Status      string               `json:"status"`
	Security    *ReportDimensionJSON `json:"security,omitempty"`
	Reliability *ReportDimensionJSON `json:"reliability,omitempty"`
	Complexity  *ReportDimensionJSON `json:"complexity,omitempty"`
	Hygiene     *ReportDimensionJSON `json:"hygiene,omitempty"`
	Coverage    *ReportCoverageJSON  `json:"coverage,omitempty"`
	Aggregate   *ReportAggregateJSON `json:"aggregate,omitempty"`
	FocusArea   *ReportFocusAreaJSON `json:"focus_area,omitempty"`
}

type ReportDimensionJSON struct {
	Grade       string `json:"grade"`
	Score       int    `json:"score"`
	IssuesCount int    `json:"issues_count"`
}

type ReportCoverageJSON struct {
	Grade          string   `json:"grade,omitempty"`
	Score          *int     `json:"score,omitempty"`
	LineCoverage   *float64 `json:"line_coverage,omitempty"`
	BranchCoverage *float64 `json:"branch_coverage,omitempty"`
}

type ReportAggregateJSON struct {
	Grade string `json:"grade"`
	Score int    `json:"score"`
}

type ReportFocusAreaJSON struct {
	Dimension string `json:"dimension,omitempty"`
	Action    string `json:"action,omitempty"`
}

// ToReportCardJSON converts a runs.ReportCard to its JSON representation.
func ToReportCardJSON(rc *runs.ReportCard) *ReportCardJSON {
	if rc == nil {
		return nil
	}
	result := &ReportCardJSON{
		Status: rc.Status,
	}
	if rc.Security != nil {
		result.Security = &ReportDimensionJSON{Grade: rc.Security.Grade, Score: rc.Security.Score, IssuesCount: rc.Security.IssuesCount}
	}
	if rc.Reliability != nil {
		result.Reliability = &ReportDimensionJSON{Grade: rc.Reliability.Grade, Score: rc.Reliability.Score, IssuesCount: rc.Reliability.IssuesCount}
	}
	if rc.Complexity != nil {
		result.Complexity = &ReportDimensionJSON{Grade: rc.Complexity.Grade, Score: rc.Complexity.Score, IssuesCount: rc.Complexity.IssuesCount}
	}
	if rc.Hygiene != nil {
		result.Hygiene = &ReportDimensionJSON{Grade: rc.Hygiene.Grade, Score: rc.Hygiene.Score, IssuesCount: rc.Hygiene.IssuesCount}
	}
	if rc.Coverage != nil {
		result.Coverage = &ReportCoverageJSON{
			Grade:          rc.Coverage.Grade,
			Score:          rc.Coverage.Score,
			LineCoverage:   rc.Coverage.LineCoverage,
			BranchCoverage: rc.Coverage.BranchCoverage,
		}
	}
	if rc.Aggregate != nil {
		result.Aggregate = &ReportAggregateJSON{Grade: rc.Aggregate.Grade, Score: rc.Aggregate.Score}
	}
	if rc.FocusArea != nil {
		result.FocusArea = &ReportFocusAreaJSON{Dimension: rc.FocusArea.Dimension, Action: rc.FocusArea.Action}
	}
	return result
}
