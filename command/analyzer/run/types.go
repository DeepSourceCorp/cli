package run

type AnalysisConfig struct {
	Files           []string    `json:"files"`
	ExcludePatterns []string    `json:"exclude_patterns"`
	ExcludeFiles    []string    `json:"exclude_files"`
	TestFiles       []string    `json:"test_files"`
	TestPatterns    []string    `json:"test_patterns"`
	AnalyzerMeta    interface{} `json:"analyzer_meta"`
}
