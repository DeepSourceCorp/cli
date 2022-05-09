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
			tomlPath:  "./testdata/analyzer1/.deepsource/analyzer/analyzer.toml",
			validTOML: true,
		},
		{
			tomlPath:  "./testdata/analyzer2/.deepsource/analyzer/analyzer.toml",
			validTOML: false,
		},
		{
			tomlPath:  "./testdata/analyzer3/.deepsource/analyzer/analyzer.toml",
			validTOML: false,
		},
	}

	for _, tc := range tests {
		_, validationErr, _ := ValidateAnalyzerTOML(tc.tomlPath)
		if validationErr != nil && tc.validTOML {
			t.Errorf("Expected valid TOML for %s. Got: %v", tc.tomlPath, validationErr)
		}
		if validationErr == nil && !tc.validTOML {
			t.Errorf("Expected invalid TOML for %s. Got: %v", tc.tomlPath, validationErr)
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
			issuesDirPath: "./testdata/analyzer1/.deepsource/analyzer/issues/",
			validIssues:   false,
		},
		{
			issuesDirPath: "./testdata/analyzer2/.deepsource/analyzer/issues/",
			validIssues:   false,
		},
	}

	for _, tc := range tests {
		validationErrors, err := ValidateIssueDescriptions(tc.issuesDirPath)
		if validationErrors != nil && tc.validIssues {
			t.Errorf("Expected valid TOML for %s. Got: %v", tc.issuesDirPath, err)
		}
		if validationErrors == nil && !tc.validIssues {
			t.Errorf("Expected invalid TOML for %s. Got: %v", tc.issuesDirPath, err)
		}
	}
}
