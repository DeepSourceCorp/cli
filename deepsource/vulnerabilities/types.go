package vulnerabilities

// VulnerabilityOccurrence represents a vulnerability occurrence
type VulnerabilityOccurrence struct {
	ID            string        `json:"id" yaml:"id"`
	Reachability  string        `json:"reachability" yaml:"reachability"`
	Fixability    string        `json:"fixability" yaml:"fixability"`
	Vulnerability Vulnerability `json:"vulnerability" yaml:"vulnerability"`
	Package       Package       `json:"package" yaml:"package"`
	PackageVersion PackageVersion `json:"package_version" yaml:"package_version"`
}

// Vulnerability represents vulnerability details
type Vulnerability struct {
	Identifier      string   `json:"identifier" yaml:"identifier"`
	Severity        string   `json:"severity" yaml:"severity"`
	Summary         string   `json:"summary" yaml:"summary"`
	CvssV3BaseScore *float64 `json:"cvss_v3_base_score,omitempty" yaml:"cvss_v3_base_score,omitempty"`
	FixedVersions   []string `json:"fixed_versions" yaml:"fixed_versions"`
	Aliases         []string `json:"aliases" yaml:"aliases"`
	EpssScore       *float64 `json:"epss_score,omitempty" yaml:"epss_score,omitempty"`
	ReferenceUrls   []string `json:"reference_urls" yaml:"reference_urls"`
}

// Package represents a package
type Package struct {
	Name      string `json:"name" yaml:"name"`
	Ecosystem string `json:"ecosystem" yaml:"ecosystem"`
}

// PackageVersion represents a package version
type PackageVersion struct {
	Version string `json:"version" yaml:"version"`
}

// RunVulns contains vulnerabilities from a specific run
type RunVulns struct {
	CommitOid     string                     `json:"commit_oid" yaml:"commit_oid"`
	BranchName    string                     `json:"branch_name" yaml:"branch_name"`
	Status        string                     `json:"status" yaml:"status"`
	Vulns         []VulnerabilityOccurrence `json:"vulnerabilities" yaml:"vulnerabilities"`
}

// PRVulns contains vulnerabilities from a pull request
type PRVulns struct {
	Number     int                        `json:"number" yaml:"number"`
	Title      string                     `json:"title" yaml:"title"`
	BaseBranch string                     `json:"base_branch" yaml:"base_branch"`
	Branch     string                     `json:"branch" yaml:"branch"`
	Vulns      []VulnerabilityOccurrence `json:"vulnerabilities" yaml:"vulnerabilities"`
}
