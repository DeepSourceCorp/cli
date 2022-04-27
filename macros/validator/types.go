package validator

type Analysis struct {
	Command    string `toml:"command" json:"command" analyzertoml:"required"`
	IssueTypes []struct {
		Name        string `toml:"name" json:"name"`
		Shortcode   string `toml:"shortcode" json:"shortcode"`
		Description string `toml:"description" json:"description"`
	} `toml:"issuestypes" json:"issue_types"`
}

type Build struct {
	Image string `toml:"image" json:"image" validate:"required"`
	Steps string `toml:"steps" json:"steps" validate:"required"`
}

// analyzer.toml type
type AnalyzerMetadata struct {
	// Analyzer specific data
	Name             string `toml:"name" json:"name" validate:"required,ascii"`
	Description      string `toml:"description" json:"description" validate:"required"`
	DocumentationURL string `toml:"documentation_url" json:"documentation_url,omitempty" validate:"omitempty,url"`
	Category         string `toml:"category" json:"category" validate:"required"`
	Logo             string `json:"logo,omitempty"` // should be an svg

	// Analyzer, Autofix and Transformer spec
	Analysis Analysis `toml:"analysis" json:"analysis" validate:"required"`

	// Build steps needed to build the analyzer
	// TODO (CSV) This isn't currently stored in the database. Let's see if we can do so
	Build Build `toml:"build" json:"build" validate:"required"`

	// TODO: Decide if this is needed?
	// Environment variables that should be set for the Macro
	Environment map[string]string `toml:"environment" json:"environment,omitempty"`

	// TODO: Decide if this is needed?
	// Meta schema for further Macro configuration
	Meta interface{} `toml:"meta" json:"meta,omitempty"`
}

// Analyzer issue description
type AnalyzerIssue struct {
	// TODO: Decide if shortcode field is required or not?
	Shortcode   string `toml:"shortcode" validate:"required"`
	Title       string `toml:"title" json:"title" validate:"required"`
	Description string `toml:"description" json:"description" validate:"required"`
	Category    string `toml:"category" json:"category" validate:"required"`
}
