package validator

import (
	"testing"
)

func TestValidateAnalyzerToml(t *testing.T) {
	type test struct {
		tomlPath  string
		validTOML bool
	}

	tests := []test{
		{
			tomlPath:  "./dummy/analyzer_toml1.toml",
			validTOML: true,
		},
		{
			tomlPath:  "./dummy/analyzer_toml2.toml",
			validTOML: false,
		},
		{
			tomlPath:  "./dummy/analyzer_toml3.toml",
			validTOML: false,
		},
	}

	for _, tc := range tests {
		_, err := ValidateAnalyzerTOML(tc.tomlPath)
		if err != nil && tc.validTOML {
			t.Errorf("Expected valid TOML for %s. Got: %v", tc.tomlPath, err)
		}
		if err == nil && !tc.validTOML {
			t.Errorf("Expected invalid TOML for %s. Got: %v", tc.tomlPath, err)
		}
	}
}

func TestValidateIssueDescriptions(t *testing.T) {
	type test struct {
		issuesDirPath string
		validIssues   bool
	}

	tests := []test{
		{
			issuesDirPath: "./dummy/issues1/",
			validIssues:   false,
		},
		{
			issuesDirPath: "./dummy/issues2/",
			validIssues:   false,
		},
	}

	for _, tc := range tests {
		validationErrors, err := ValidateIssueDescriptions(tc.issuesDirPath)
		if len(validationErrors) > 0 && tc.validIssues {
			t.Errorf("Expected valid TOML for %s. Got: %v", tc.issuesDirPath, err)
		}
		if len(validationErrors) ==0 && !tc.validIssues {
			t.Errorf("Expected invalid TOML for %s. Got: %v", tc.issuesDirPath, err)
		}
	}
}
