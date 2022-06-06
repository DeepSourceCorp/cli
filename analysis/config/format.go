package config

import (
	"github.com/deepsourcelabs/cli/analysis/lsp"
)

/* Formats the analysis config data in the form of the LSP format as defined in
 * the `analysis/types.go` */
func (r *AnalysisRun) formatAnalysisConfigToLSP() *AnalysisConfig {
	anaConfig := AnalysisConfig{
		ExcludePatterns: r.DSConfig.ExcludePatterns,
		TestPatterns:    r.DSConfig.TestPatterns,
	}

	// Store the files, test files and excluded files in the LSP based analysis config
	for _, file := range r.AnalysisFiles {
		anaConfig.Files = append(anaConfig.Files, lsp.TextDocumentItem{URI: lsp.DocumentURI(file)})
	}

	for _, testFile := range r.TestFiles {
		anaConfig.TestFiles = append(anaConfig.TestFiles, lsp.TextDocumentItem{URI: lsp.DocumentURI(testFile)})
	}

	for _, excludedFile := range r.ExcludedFiles {
		anaConfig.ExcludedFiles = append(anaConfig.ExcludedFiles, lsp.TextDocumentItem{URI: lsp.DocumentURI(excludedFile)})
	}

	// Read analyzer_meta from DeepSource config (.deepsource.toml) and
	// store the one corresponding to the Analyzer whose check is scheduled in analysis_config.json
	for _, analyzer := range r.DSConfig.Analyzers {
		if analyzer.Name == r.AnalyzerName {
			anaConfig.AnalyzerMeta = analyzer.Meta
		}
	}
	return &anaConfig
}
