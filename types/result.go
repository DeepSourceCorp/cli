package types

import "github.com/deepsourcelabs/cli/analysis/lsp"

//////////////////////////////////////
// LSP based Analysis Result Types  //
/////////////////////////////////////

type AnalysisResult struct {
	Issues   []lsp.Diagnostic `json:"issues"`
	Metrics  []Metric         `json:"metrics,omitempty"`
	IsPassed bool             `json:"is_passed"`
	Errors   []Error          `json:"errors"`
	// Errors    []lsp.Diagnostic `json:"errors"`
	ExtraData interface{} `json:"extra_data"`
}

////////////////////////////////////
// Default Analysis Result Types  //
///////////////////////////////////

type Error struct {
	HMessage string `json:"hmessage"`
	Level    int    `json:"level"`
}

type Issue struct {
	Code     string   `json:"issue_code"`
	Title    string   `json:"issue_text"`
	Location Location `json:"location"`
}

type DefaultAnalysisResult struct {
	Issues    []Issue     `json:"issues"`
	Metrics   []Metric    `json:"metrics,omitempty"`
	IsPassed  bool        `json:"is_passed"`
	Errors    []Error     `json:"errors"`
	ExtraData interface{} `json:"extra_data"`
}
