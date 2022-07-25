package config

/* Formats the analysis config data in the form of the LSP format as defined in
 * the `analysis/types.go` */
func (r *AnalysisRun) formatAnalysisConfigToLSP() *AnalysisConfig {
	anaConfig := AnalysisConfig{
		Files:           r.AnalysisFiles,
		ExcludeFiles:    r.ExcludedFiles,
		TestFiles:       r.TestFiles,
		ExcludePatterns: r.DSConfig.ExcludePatterns,
		TestPatterns:    r.DSConfig.TestPatterns,
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
