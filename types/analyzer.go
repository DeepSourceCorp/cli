/* =============================================================
 * Contains type definitions with respect to Analyzers, Issues
 * and their configuration.
 * ============================================================= */
package types

import "html/template"

/* ====================
 * Analyzer TOML Types
 * ==================== */

type Analysis struct {
	Command string `toml:"command" json:"command" validate:"required"`
}

// TODO: Remove the comment when we start support for Autofix.
// type Autofix struct {
//     Command string `toml:"command" json:"command" analyzertoml:"required"`
// }

type Build struct {
	Engine     string `toml:"engine" json:"engine" validate:"omitempty,engine"`
	Dockerfile string `toml:"dockerfile" json:"dockerfile,omitempty" validate:"omitempty"`
	Script     string `toml:"script,multiline" json:"script" validate:"omitempty"`
}

type Test struct {
	Command string `toml:"command" json:"command" validate:"omitempty"`
}

// analyzer.toml type
type AnalyzerTOML struct {
	// Analyzer specific data
	Name             string   `toml:"name" json:"name" validate:"required"`
	Shortcode        string   `toml:"shortcode" json:"shortcode" validate:"required,shortcode"`
	Description      string   `toml:"description" json:"description" validate:"required"`
	Tags             []string `toml:"tags" json:"tags,omitempty" validate:"omitempty"`
	Repository       string   `toml:"repository" json:"repository" validate:"omitempty,url"`
	DocumentationURL string   `toml:"documentation" json:"documentation,omitempty" validate:"omitempty,url"`
	BugTrackerURL    string   `toml:"bug_tracker" json:"bug_tracker" validate:"omitempty,url"`

	EnvironmentVariables map[string]string `toml:"environment_variables" json:"environment_variables,omitempty" validate:"omitempty"`

	// Analyzer, Autofix and Transformer config
	Analysis Analysis `toml:"analysis" json:"analysis" validate:"required"`
	// Autofix Autofix `toml:"autofix" json:"autofix" validate:"omitempty"`

	// Build steps needed to build the analyzer
	Build Build `toml:"build" json:"build" validate:"omitempty"`

	// Test command for running the testing workflow
	Test Test `toml:"test" json:"test" validate:"omitempty"`
}

/* =========================
 * Analyzer Issue TOML Types
 * ========================= */

// Analyzer issue type.
type AnalyzerIssue struct {
	Shortcode       string `validate:"omitempty"`
	Title           string `toml:"title" json:"title" validate:"required"`
	Description     string `toml:"description" json:"description" validate:"required"`
	HTMLDescription template.HTML
	Category        string `toml:"category" json:"category" validate:"required,category"`
}
