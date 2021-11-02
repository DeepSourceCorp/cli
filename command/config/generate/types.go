package generate

// DSConfig is the struct for .deepsource.toml file
type Analyzer struct {
	Name                string      `toml:"name,omitempty" json:"name,omitempty"`
	RuntimeVersion      string      `toml:"runtime_version,omitempty" json:"runtime_version,omitempty"`
	Enabled             bool        `toml:"enabled" json:"enabled"`
	DependencyFilePaths []string    `toml:"dependency_file_paths,omitempty" json:"dependency_file_paths,omitempty"`
	Meta                interface{} `toml:"meta,omitempty" json:"meta,omitempty"`
	Thresholds          interface{} `toml:"thresholds,omitempty" json:"thresholds,omitempty"`
}

type Transformer struct {
	Name    string `toml:"name" json:"name"`
	Enabled bool   `toml:"enabled" json:"enabled"`
}

type DSConfig struct {
	Version         int           `toml:"version" json:"version"`
	ExcludePatterns []string      `toml:"exclude_patterns" json:"exclude_patterns,omitempty"`
	TestPatterns    []string      `toml:"test_patterns" json:"test_patterns,omitempty"`
	Analyzers       []Analyzer    `toml:"analyzers,omitempty" json:"analyzers,omitempty"`
	Transformers    []Transformer `toml:"transformers,omitempty" json:"transformers,omitempty"`
}
