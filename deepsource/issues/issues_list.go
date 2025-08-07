package issues

type Position struct {
	BeginLine int `json:"begin"` // The line where the code covered under the issue starts
	EndLine   int `json:"end"`   // The line where the code covered under the issue starts
}

type Location struct {
	Path     string   `json:"path"`     // The filepath where the issue is reported
	Position Position `json:"position"` // The position info where the issue is raised
}

type AnalyzerMeta struct {
	Shortcode string `json:"analyzer"` // Analyzer shortcode
}

type Issue struct {
	IssueText     string       `json:"issue_title"`    // The describing heading of the issue
	IssueCode     string       `json:"issue_code"`     // DeepSource code for the issue reported
	IssueCategory string       `json:"issue_category"` // Category of the issue reported
	IssueSeverity string       `json:"issue_severity"` // Severity of the issue reported
	Location      Location     `json:"location"`       // The location data for the issue reported
	Analyzer      AnalyzerMeta // The Analyzer which raised the issue
}
