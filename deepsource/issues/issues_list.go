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
	IssueText string       `json:"issue_title"` // The describing heading of the issue
	IssueCode string       `json:"issue_code"`  // DeepSource code for the issue reported
	Location  Location     `json:"location"`    // The location data for the issue reported
	Analyzer  AnalyzerMeta // The Analyzer which raised the issue

}

// custom types for JSON marshaling

type IssueJSON struct {
	Analyzer       string       `json:"analyzer"`
	IssueCode      string       `json:"issue_code"`
	IssueTitle     string       `json:"issue_title"`
	OccurenceTitle string       `json:"occurence_title"`
	IssueCategory  string       `json:"issue_category"`
	Location       LocationJSON `json:"location"`
}

type LocationJSON struct {
	Path     string       `json:"path"`     // The filepath where the issue is reported
	Position PositionJSON `json:"position"` // The position info where the issue is raised
}

type PositionJSON struct {
	Begin LineColumn `json:"begin"` // The line where the code covered under the issue starts
	End   LineColumn `json:"end"`   // The line where the code covered under the issue starts
}

type LineColumn struct {
	Line   int `json:"line"`
	Column int `json:"column"`
}
