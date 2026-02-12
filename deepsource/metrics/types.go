package metrics

// RepositoryMetric represents a metric from a repository
type RepositoryMetric struct {
	Name              string              `json:"name" yaml:"name"`
	Shortcode         string              `json:"shortcode" yaml:"shortcode"`
	Description       string              `json:"description" yaml:"description"`
	PositiveDirection string              `json:"positive_direction" yaml:"positive_direction"`
	Unit              string              `json:"unit" yaml:"unit"`
	IsReported        bool                `json:"is_reported" yaml:"is_reported"`
	IsThresholdEnforced bool              `json:"is_threshold_enforced" yaml:"is_threshold_enforced"`
	Items             []RepositoryMetricItem `json:"items" yaml:"items"`
}

// RepositoryMetricItem represents an item within a repository metric
type RepositoryMetricItem struct {
	Key               string   `json:"key" yaml:"key"`
	Threshold         *int     `json:"threshold,omitempty" yaml:"threshold,omitempty"`
	LatestValue       *float64 `json:"latest_value,omitempty" yaml:"latest_value,omitempty"`
	LatestValueDisplay string  `json:"latest_value_display" yaml:"latest_value_display"`
	ThresholdStatus   string   `json:"threshold_status,omitempty" yaml:"threshold_status,omitempty"`
}

// RunMetrics contains metrics from a specific run
type RunMetrics struct {
	CommitOid     string             `json:"commit_oid" yaml:"commit_oid"`
	BranchName    string             `json:"branch_name" yaml:"branch_name"`
	Status        string             `json:"status" yaml:"status"`
	Metrics       []RepositoryMetric `json:"metrics" yaml:"metrics"`
	ChangesetStats *ChangesetStats   `json:"changeset_stats,omitempty" yaml:"changeset_stats,omitempty"`
}

// ChangesetStats contains coverage stats for a changeset
type ChangesetStats struct {
	Lines      ChangesetStatsCounts `json:"lines" yaml:"lines"`
	Branches   ChangesetStatsCounts `json:"branches" yaml:"branches"`
	Conditions ChangesetStatsCounts `json:"conditions" yaml:"conditions"`
}

// ChangesetStatsCounts contains coverage counts
type ChangesetStatsCounts struct {
	Overall        *int `json:"overall,omitempty" yaml:"overall,omitempty"`
	OverallCovered *int `json:"overall_covered,omitempty" yaml:"overall_covered,omitempty"`
	New            *int `json:"new,omitempty" yaml:"new,omitempty"`
	NewCovered     *int `json:"new_covered,omitempty" yaml:"new_covered,omitempty"`
}

// PRMetrics contains metrics from a pull request
type PRMetrics struct {
	Number     int                `json:"number" yaml:"number"`
	Title      string             `json:"title" yaml:"title"`
	BaseBranch string             `json:"base_branch" yaml:"base_branch"`
	Branch     string             `json:"branch" yaml:"branch"`
	Metrics    []RepositoryMetric `json:"metrics" yaml:"metrics"`
}
