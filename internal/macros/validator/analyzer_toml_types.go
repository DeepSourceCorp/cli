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
	Image string `toml:"image" json:"image" analyzertoml:"required"`
	Steps string `toml:"steps" json:"steps" analyzertoml:"required"`
}

type AnalyzerMetadata struct {
	// Analyzer specific data
	Name             string `toml:"name" json:"name" validate:"required"`
	Description      string `toml:"description" json:"description" validate:"required"`
	DocumentationURL string `toml:"documentation_url" json:"documentation_url"`
	Category         string `toml:"category" json:"category" validate:"required"`
	Logo             string `json:"logo"` // should be an svg

	// Analyzer, Autofix and Transformer spec
	Analysis Analysis `toml:"analysis" json:"analysis" validate:"required"`

	// Build steps needed to build the analyzer
	// TODO (CSV) This isn't currently stored in the database. Let's see if we can do so
	Build Build `toml:"build" json:"build" validate:"required"`

	// TODO: Decide if this is needed?
	// Environment variables that should be set for the Macro
	Environment map[string]string `toml:"environment" json:"environment"`

	// TODO: Decide if this is needed?
	// Meta schema for further Macro configuration
	Meta interface{} `toml:"meta" json:"meta"`
}
