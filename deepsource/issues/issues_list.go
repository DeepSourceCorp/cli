package issues

type Position struct {
	BeginLine int `json:"begin"`
	EndLine   int `json:"end"`
}

type Location struct {
	Path     string   `json:"path"`
	Position Position `json:"position"`
}

type AnalyzerMeta struct {
	Name      string `json:"name"`
	Shortcode string `json:"analyzer"`
}

type Issue struct {
	IssueText     string       `json:"issue_title"`
	IssueCode     string       `json:"issue_code"`
	IssueCategory string       `json:"issue_category"`
	IssueSeverity string       `json:"issue_severity"`
	IssueSource   string       `json:"issue_source"`
	Description   string       `json:"description"`
	Location      Location     `json:"location"`
	Analyzer      AnalyzerMeta
}
