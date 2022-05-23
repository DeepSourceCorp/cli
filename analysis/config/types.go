package config

import "github.com/deepsourcelabs/cli/analysis/lsp"

//////////////////////////////////////////////////////
// DSConfig is the struct for .deepsource.toml file //
/////////////////////////////////////////////////////

type DSConfig struct {
	Version         int           `mapstructure:"version,omitempty" json:"version" toml:"version"`
	ExcludePatterns []string      `mapstructure:"exclude_patterns,omitempty" json:"exclude_patterns,omitempty" toml:"exclude_patterns"`
	TestPatterns    []string      `mapstructure:"test_patterns,omitempty" json:"test_patterns,omitempty" toml:"test_patterns"`
	Analyzers       []Analyzer    `mapstructure:"analyzers,omitempty" json:"analyzers,omitempty" toml:"analyzers"`
	Transformers    []Transformer `mapstructure:"transformers,omitempty" json:"transformers,omitempty" toml:"transformers"`
}

type Analyzer struct {
	Name                string      `mapstructure:"name,omitempty" json:"name,omitempty" toml:"name"`
	RuntimeVersion      string      `mapstructure:"runtime_version,omitempty" json:"runtime_version,omitempty" toml:"runtime_version,omitempty"`
	Enabled             bool        `mapstructure:"enabled,omitempty" json:"enabled" toml:"enabled"`
	DependencyFilePaths []string    `mapstructure:"dependency_file_paths,omitempty" json:"dependency_file_paths,omitempty"`
	Meta                interface{} `mapstructure:"meta,omitempty" json:"meta,omitempty" toml:"meta"`
	Thresholds          interface{} `mapstructure:"thresholds,omitempty" json:"thresholds,omitempty"`
}

type Transformer struct {
	Name    string `mapstructure:"name,omitempty" json:"name,omitempty" toml:"name"`
	Enabled bool   `mapstructure:"enabled,omitempty" json:"enabled,omitempty" toml:"enabled"`
}

////////////////////////////
// Analysis Config Types  //
////////////////////////////

type AnalysisConfig struct {
	Files           []lsp.TextDocumentItem `json:"files"`
	TestFiles       []lsp.TextDocumentItem `json:"test_files"`
	ExcludedFiles   []lsp.TextDocumentItem `json:"excluded_files"`
	ExcludePatterns []string               `json:"exclude_patterns"`
	TestPatterns    []string               `json:"test_patterns"`
	AnalyzerMeta    interface{}            `json:"analyzer_meta"`
}

////////////////////////////
// Analysis Result Types  //
////////////////////////////

type Namespace struct {
	Key   string  `json:"key"`
	Value float64 `json:"value"`
}

type Metric struct {
	MetricCode string      `json:"metric_code"`
	Namespaces []Namespace `json:"namespaces"`
}

type AnalysisResult struct {
	Issues    []lsp.Diagnostic `json:"issues"`
	Metrics   []Metric         `json:"metrics,omitempty"`
	IsPassed  bool             `json:"is_passed"`
	Errors    []lsp.Diagnostic `json:"errors"`
	ExtraData interface{}      `json:"extra_data"`
}
