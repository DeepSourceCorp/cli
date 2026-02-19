package metrics

// RepositoryMetric represents a metric from a repository
type RepositoryMetric struct {
	Name                string               `json:"name"`
	Shortcode           string               `json:"shortcode"`
	Description         string               `json:"description"`
	PositiveDirection   string               `json:"positive_direction"`
	Unit                string               `json:"unit"`
	IsReported          bool                 `json:"is_reported"`
	IsThresholdEnforced bool                 `json:"is_threshold_enforced"`
	Items               []RepositoryMetricItem `json:"items"`
}

// RepositoryMetricItem represents an item within a repository metric
type RepositoryMetricItem struct {
	Key                string   `json:"key"`
	Threshold          *int     `json:"threshold,omitempty"`
	LatestValue        *float64 `json:"latest_value,omitempty"`
	LatestValueDisplay string   `json:"latest_value_display"`
	ThresholdStatus    string   `json:"threshold_status,omitempty"`
}

// RunMetrics contains metrics from a specific run
type RunMetrics struct {
	CommitOid      string             `json:"commit_oid"`
	BranchName     string             `json:"branch_name"`
	Status         string             `json:"status"`
	Metrics        []RepositoryMetric `json:"metrics"`
	ChangesetStats *ChangesetStats    `json:"changeset_stats,omitempty"`
}

// ChangesetStats contains coverage stats for a changeset
type ChangesetStats struct {
	Lines      ChangesetStatsCounts `json:"lines"`
	Branches   ChangesetStatsCounts `json:"branches"`
	Conditions ChangesetStatsCounts `json:"conditions"`
}

// ChangesetStatsCounts contains coverage counts
type ChangesetStatsCounts struct {
	Overall        *int `json:"overall,omitempty"`
	OverallCovered *int `json:"overall_covered,omitempty"`
	New            *int `json:"new,omitempty"`
	NewCovered     *int `json:"new_covered,omitempty"`
}

// PRMetrics contains metrics from a pull request
type PRMetrics struct {
	Number     int                `json:"number"`
	Title      string             `json:"title"`
	BaseBranch string             `json:"base_branch"`
	Branch     string             `json:"branch"`
	Metrics    []RepositoryMetric `json:"metrics"`
}
