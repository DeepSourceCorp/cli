package vulnerabilities

// VulnerabilityOccurrence represents a vulnerability occurrence
type VulnerabilityOccurrence struct {
	ID             string         `json:"id"`
	Reachability   string         `json:"reachability"`
	Fixability     string         `json:"fixability"`
	Vulnerability  Vulnerability  `json:"vulnerability"`
	Package        Package        `json:"package"`
	PackageVersion PackageVersion `json:"package_version"`
}

// Vulnerability represents vulnerability details
type Vulnerability struct {
	Identifier      string   `json:"identifier"`
	Severity        string   `json:"severity"`
	Summary         string   `json:"summary"`
	CvssV3BaseScore *float64 `json:"cvss_v3_base_score,omitempty"`
	FixedVersions   []string `json:"fixed_versions"`
	Aliases         []string `json:"aliases"`
	EpssScore       *float64 `json:"epss_score,omitempty"`
	ReferenceUrls   []string `json:"reference_urls"`
}

// Package represents a package
type Package struct {
	Name      string `json:"name"`
	Ecosystem string `json:"ecosystem"`
}

// PackageVersion represents a package version
type PackageVersion struct {
	Version string `json:"version"`
}

// RunVulns contains vulnerabilities from a specific run
type RunVulns struct {
	CommitOid  string                    `json:"commit_oid"`
	BranchName string                    `json:"branch_name"`
	Status     string                    `json:"status"`
	Vulns      []VulnerabilityOccurrence `json:"vulnerabilities"`
}

// PRVulns contains vulnerabilities from a pull request
type PRVulns struct {
	Number     int                       `json:"number"`
	Title      string                    `json:"title"`
	BaseBranch string                    `json:"base_branch"`
	Branch     string                    `json:"branch"`
	Vulns      []VulnerabilityOccurrence `json:"vulnerabilities"`
}
