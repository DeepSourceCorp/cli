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
		if err != nil {
			t.Error("Analyzer verification failed. Error:", err)
		}
	}
}
