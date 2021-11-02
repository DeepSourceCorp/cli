package configvalidator

// DSConfig is the struct for .deepsource.toml file
type Analyzer struct {
	Name                string      `mapstructure:"name,omitempty" json:"name,omitempty"`
	RuntimeVersion      string      `mapstructure:"runtime_version,omitempty" json:"runtime_version,omitempty"`
	Enabled             bool        `mapstructure:"enabled,omitempty" json:"enabled"`
	DependencyFilePaths []string    `mapstructure:"dependency_file_paths,omitempty" json:"dependency_file_paths,omitempty"`
	Meta                interface{} `mapstructure:"meta,omitempty" json:"meta,omitempty"`
	Thresholds          interface{} `mapstructure:"thresholds,omitempty" json:"thresholds,omitempty"`
}

type Transformer struct {
	Name    string `mapstructure:"name,omitempty" json:"name,omitempty"`
	Enabled bool   `mapstructure:"enabled,omitempty" json:"enabled,omitempty"`
}

type DSConfig struct {
	Version         int           `mapstructure:"version,omitempty" json:"version"`
	ExcludePatterns []string      `mapstructure:"exclude_patterns,omitempty" json:"exclude_patterns,omitempty"`
	TestPatterns    []string      `mapstructure:"test_patterns,omitempty" json:"test_patterns,omitempty"`
	Analyzers       []Analyzer    `mapstructure:"analyzers,omitempty" json:"analyzers,omitempty"`
	Transformers    []Transformer `mapstructure:"transformers,omitempty" json:"transformers,omitempty"`
}
