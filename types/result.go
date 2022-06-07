package types

import "github.com/deepsourcelabs/cli/analysis/lsp"

///////////////////////////////////////
// LSP based Analysis Report Types  //
/////////////////////////////////////

type AnalysisReport struct {
	Issues   []lsp.Diagnostic `json:"issues"`
	Metrics  []Metric         `json:"metrics,omitempty"`
	IsPassed bool             `json:"is_passed"`
	Errors   []Error          `json:"errors"`
	// Errors    []lsp.Diagnostic `json:"errors"`
	ExtraData interface{} `json:"extra_data"`
}

/////////////////////////////
// Final Analysis Result  //
///////////////////////////

type AnalysisResult struct {
	Issues   []Issue  `json:"issues"`
	Metrics  []Metric `json:"metrics,omitempty"`
	IsPassed bool     `json:"is_passed"`
	Errors   []Error  `json:"errors"`
}

type SourceCode struct {
	Rendered string `json:"rendered"`
}

type ProcessedData struct {
	SourceCode SourceCode `json:"source_code,omitempty"`
}

type Issue struct {
	IssueCode     string        `json:"issue_code"`
	IssueText     string        `json:"issue_text"`
	Location      Location      `json:"location"`
	ProcessedData ProcessedData `json:"processed_data,omitempty"`
}

type Error struct {
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
