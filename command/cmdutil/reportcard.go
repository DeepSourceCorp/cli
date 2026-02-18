package cmdutil

import (
	"fmt"
	"strings"

	"github.com/deepsourcelabs/cli/deepsource/runs"
	"github.com/pterm/pterm"
)

// ShowReportCard renders a report card as a pterm table.
func ShowReportCard(rc *runs.ReportCard) {
	if rc == nil {
		return
	}

	pterm.Println()
	pterm.DefaultSection.Println("Report Card")

	header := []string{"Dimension", "Grade", "Score", "Issues"}
	data := [][]string{header}

	if rc.Security != nil {
		data = append(data, []string{"Security", gradeColor(rc.Security.Grade), fmt.Sprintf("%d", rc.Security.Score), fmt.Sprintf("%d", rc.Security.IssuesCount)})
	}
	if rc.Reliability != nil {
		data = append(data, []string{"Reliability", gradeColor(rc.Reliability.Grade), fmt.Sprintf("%d", rc.Reliability.Score), fmt.Sprintf("%d", rc.Reliability.IssuesCount)})
	}
	if rc.Complexity != nil {
		data = append(data, []string{"Complexity", gradeColor(rc.Complexity.Grade), fmt.Sprintf("%d", rc.Complexity.Score), fmt.Sprintf("%d", rc.Complexity.IssuesCount)})
	}
	if rc.Hygiene != nil {
		data = append(data, []string{"Hygiene", gradeColor(rc.Hygiene.Grade), fmt.Sprintf("%d", rc.Hygiene.Score), fmt.Sprintf("%d", rc.Hygiene.IssuesCount)})
	}

	pterm.DefaultTable.WithHasHeader().WithData(data).Render()

	if rc.Coverage != nil {
		parts := []string{}
		if rc.Coverage.Grade != "" {
			parts = append(parts, fmt.Sprintf("Grade: %s", gradeColor(rc.Coverage.Grade)))
		}
		if rc.Coverage.LineCoverage != nil {
			parts = append(parts, fmt.Sprintf("Line: %.1f%%", *rc.Coverage.LineCoverage))
		}
		if rc.Coverage.BranchCoverage != nil {
			parts = append(parts, fmt.Sprintf("Branch: %.1f%%", *rc.Coverage.BranchCoverage))
		}
		if len(parts) > 0 {
			pterm.Println()
			pterm.Printf("  %s  %s\n", pterm.Bold.Sprint("Coverage:"), strings.Join(parts, "  |  "))
		}
	}

	if rc.Aggregate != nil {
		pterm.Printf("  %s  %s (score: %d)\n", pterm.Bold.Sprint("Aggregate:"), gradeColor(rc.Aggregate.Grade), rc.Aggregate.Score)
	}

	if rc.FocusArea != nil && rc.FocusArea.Dimension != "" {
		pterm.Printf("  %s  %s — %s\n", pterm.Bold.Sprint("Focus Area:"), FormatCategory(rc.FocusArea.Dimension), rc.FocusArea.Action)
	}
}

func gradeColor(grade string) string {
	switch {
	case strings.HasPrefix(grade, "A"):
		return pterm.Green(grade)
	case strings.HasPrefix(grade, "B"):
		return pterm.LightGreen(grade)
	case strings.HasPrefix(grade, "C"):
		return pterm.Yellow(grade)
	case strings.HasPrefix(grade, "D"):
		return pterm.LightRed(grade)
	default:
		return pterm.Red(grade)
	}
}

// FormatCategory converts "BUG_RISK" to "Bug Risk", "SECURITY" to "Security", etc.
func FormatCategory(s string) string {
	parts := strings.Split(strings.ToLower(s), "_")
	for i, p := range parts {
		if len(p) > 0 {
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
