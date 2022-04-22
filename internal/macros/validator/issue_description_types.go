package validator

type AnalyzerIssue struct {
	// TODO: Decide if shortcode field is required or not?
	Shortcode   bool   `toml:"shortcode" validate:"required"`
	Title       string `toml:"title" json:"title" validate:"required"`
	Description string `toml:"description" json:"description" validate:"required"`
	Category    string `toml:"category" json:"category" validate:"required"`
}
