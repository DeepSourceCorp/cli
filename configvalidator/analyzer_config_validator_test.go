package configvalidator

import (
	"reflect"
	"testing"
)

func TestValidateAnalyzersConfig(t *testing.T) {
	setDummyAnalyzerTransformerData()
	type test struct {
		inputConfig string
		result      bool
	}

	tests := map[string]test{
		"valid config": {
			inputConfig: `
            [[analyzers]]
            name = "python"
            enabled = true`,
			result: true,
		},
		"name should be a string": {
			inputConfig: `
            [[analyzers]]
            name = 123
            enabled = true`,
			result: false,
		},
		"`analyzers` should be an array": {
			inputConfig: `
            analyzers = "python"
            enabled = true`,
			result: false,
		},
		"atleast one analyzer should be enabled": {
			inputConfig: `
            [[analyzers]]
            name = "python"
            enabled = false`,
			result: false,
		},
		"name cannot be of an unsupported analyzer": {
			inputConfig: `
            [[analyzers]]
            name = "foobar"
            enabled = true`,
			result: false,
		},
		"analyzer with meta config": {
			inputConfig: `
            [[analyzers]]
            name = "python"
            enabled = true

                [analyzers.meta]
                max_line_length = 100
                skip_doc_coverage = ["module", "magic", "class"]`,
			result: true,
		},
		"max_line_length meta property validation": {
			inputConfig: `
            [[analyzers]]
            name = "python"
            enabled = true

                [analyzers.meta]
                max_line_length = -100`,
			result: false,
		},
		"valid multiple analyzers": {
			inputConfig: `
            [[analyzers]]
            name = "python"
            enabled = true

                [analyzers.meta]
                max_line_length = 100

            [[analyzers]]
            name = "test-coverage"
            enabled = true`,
			result: true,
		},
	}
	for testName, tc := range tests {
		t.Run(testName, func(t *testing.T) {
			testConfig, err := getConfig([]byte(tc.inputConfig))
			if err != nil {
				t.Error(err)
			}
			c := &ConfigValidator{
				Config: *testConfig,
				Result: Result{
					Valid:           true,
					Errors:          []string{},
					ConfigReadError: false,
				},
			}
			c.validateAnalyzersConfig()
			if !reflect.DeepEqual(tc.result, c.Result.Valid) {
				t.Errorf("expected: %v, got: %v. Error: %v", tc.result, c.Result.Valid, c.Result.Errors)
			}
		})
	}
}
