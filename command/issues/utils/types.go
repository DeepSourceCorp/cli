package utils

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
