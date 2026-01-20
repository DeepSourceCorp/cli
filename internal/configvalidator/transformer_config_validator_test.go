package configvalidator

import (
	"reflect"
	"testing"
)

func TestValidateTransformersConfig(t *testing.T) {
	setDummyAnalyzerTransformerData()
	type test struct {
		inputConfig string
		result      bool
	}

	tests := map[string]test{
		"valid config": {
			inputConfig: `
            [[transformers]]
            name = "black"
            enabled = true`,
			result: true,
		},
		"transformers are not mandatory lik}e analyzers": {
			inputConfig: `
            [[transformers]]
            name = "black"
            enabled = false`,
			result: true,
		},
		"can't use unsupported analyzer": {
			inputConfig: `
            [[transformers]]
            name = "rick-astley"
            enabled = true`,
			result: false,
		},
		"multiple transformers": {
			inputConfig: `
            [[transformers]]
            name = "black"
            enabled = true

            [[transformers]]
            name = "prettier"
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
			c.validateTransformersConfig()
			if !reflect.DeepEqual(tc.result, c.Result.Valid) {
				t.Errorf("expected: %v, got: %v. Error: %v", tc.result, c.Result.Valid, c.Result.Errors)
			}
		})
	}
}
