package types

/////////////////////////////////
// Final Analysis Report Type //
///////////////////////////////

type AnalysisReport struct {
	Issues   []AnalysisIssue `json:"issues"`
	Metrics  []Metric        `json:"metrics,omitempty"`
	IsPassed bool            `json:"is_passed"`
	Errors   []AnalysisError `json:"errors"`
}

type SourceCode struct {
	Rendered []byte `json:"rendered"`
}

type ProcessedData struct {
	SourceCode SourceCode `json:"source_code,omitempty"`
}

type AnalysisIssue struct {
	IssueCode     string        `json:"issue_code"`
	IssueText     string        `json:"issue_text"`
	Location      Location      `json:"location"`
	ProcessedData ProcessedData `json:"processed_data,omitempty"`
}

type AnalysisError struct {
	HMessage string `json:"hmessage"`
	Level    int    `json:"level"`
}

type Namespace struct {
	Key   string  `json:"key"`
	Value float64 `json:"value"`
}

type Metric struct {
	MetricCode string      `json:"metric_code"`
	Namespaces []Namespace `json:"namespaces"`
}

type Coordinate struct {
	Line   int `json:"line"`
	Column int `json:"column"`
}

type Position struct {
	Begin Coordinate `json:"begin"`
	End   Coordinate `json:"end"`
}

type Location struct {
	Path     string   `json:"path"`
	Position Position `json:"position"`
}
