package configvalidator

import (
	"reflect"
	"testing"

	"github.com/deepsourcelabs/cli/utils"
)

func TestValidateTransformersConfig(t *testing.T) {
	type test struct {
		inputConfig string
		result      bool
	}

	utils.TrData.TransformerShortcodes = []string{"black", "prettier"}

	tests := []test{
		{
			inputConfig: `
            [[transformers]]
            name = "black"
            enabled = true`,
			result: true,
		},
		{
			inputConfig: `
            [[transformers]]
            name = "black"
            enabled = false`,
			result: true,
		},
		{
			inputConfig: `
            [[transformers]]
            name = "rick-astley"
            enabled = true`,
			result: false,
		},
		{
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
	for _, tc := range tests {
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
	}
}
