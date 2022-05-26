package config

type Analysis struct {
	Command string `toml:"command" json:"command" validate:"required"`
}

// TODO: Remove the comment when we start support for Autofix.
// type Autofix struct {
//     Command string `toml:"command" json:"command" analyzertoml:"required"`
// }

type Build struct {
	Builder    string `toml:"builder" json:"builder" validate:"omitempty"`
	Dockerfile string `toml:"dockerfile" json:"dockerfile,omitempty" validate:"omitempty"`
	Script     string `toml:"script" json:"script" validate:"omitempty"`
}

type URL struct {
	Source        string `toml:"source" json:"source" validate:"omitempty,url"`
	Documentation string `toml:"documentation" json:"documentation,omitempty" validate:"omitempty,url"`
	BugTracker    string `toml:"bug_tracker" json:"bug_tracker" validate:"omitempty,url"`
}

type Test struct {
	Command string `toml:"command" json:"command" validate:"omitempty"`
}

// analyzer.toml type
type AnalyzerMetadata struct {
	// Analyzer specific data
	Name                 string            `toml:"name" json:"name" validate:"required"`
	Shortcode            string            `toml:"shortcode" json:"shortcode" validate:"required"` // New
	Description          string            `toml:"description" json:"description" validate:"required"`
	Category             string            `toml:"category" json:"category" validate:"required"`
	Tags                 []string          `toml:"tags" json:"tags,omitempty" validate:"omitempty"`
	URL                  URL               `toml:"urls" json:"urls,omitempty" validate:"omitempty"`
	EnvironmentVariables map[string]string `toml:"environment_variables" json:"environment_variables,omitempty" validate:"omitempty"`

	// Analyzer, Autofix and Transformer config
	Analysis Analysis `toml:"analysis" json:"analysis" validate:"required"`
	// Autofix Autofix `toml:"autofix" json:"autofix" validate:"omitempty"`

	// Build steps needed to build the analyzer
	Build Build `toml:"build" json:"build" validate:"omitempty"`

	// Test command for running the testing workflow
	Test Test `toml:"test" json:"test" validate:"omitempty"`
}

// Analyzer issue description
type AnalyzerIssue struct {
	Shortcode   string `validate:"omitempty"`
	Title       string `toml:"title" json:"title" validate:"required"`
	Description string `toml:"description" json:"description" validate:"required"`
	Category    string `toml:"category" json:"category" validate:"required"`
}
