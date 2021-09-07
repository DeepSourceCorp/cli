package configvalidator

import (
	"bytes"
	"reflect"
	"testing"

	"github.com/spf13/viper"
)

func TestValidateVersion(t *testing.T) {
	type test struct {
		inputConfig string
		result      bool
	}

	tests := []test{
		{
			inputConfig: "version = 1",
			result:      true,
		},
		{
			inputConfig: "version = \"foobar\"",
			result:      false,
		},
		{
			inputConfig: "version = 352",
			result:      false,
		},
		{
			inputConfig: "",
			result:      false,
		},
		{
			inputConfig: "version = \"2\"",
			result:      false,
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

		c.validateVersion()
		if !reflect.DeepEqual(tc.result, c.Result.Valid) {
			t.Fatalf("expected: %v, got: %v. Error: %v", tc.result, c.Result.Valid, c.Result.Errors)
		}
	}
}

func TestValidateExcludePatterns(t *testing.T) {
	type test struct {
		inputConfig string
		result      bool
	}

	tests := []test{
		{
			inputConfig: "version= 1\nexclude_patterns = 23",
			result:      false,
		},
		{
			inputConfig: "version= 1\nexclude_patterns = [23,43]",
			result:      false,
		},
		{
			inputConfig: "version = 1\nexclude_patterns = ['hello', 'world']",
			result:      true,
		},
		{
			inputConfig: "exclude_patterns = [\"hello\",\"world\"]",
			result:      true,
		},
		{
			inputConfig: "exclude_patterns = []",
			result:      true,
		},
		{
			inputConfig: "version = 1\nexclude_patterns = 'hello'",
			result:      false,
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

		c.validateExcludePatterns()
		if !reflect.DeepEqual(tc.result, c.Result.Valid) {
			t.Fatalf("Config : %v, expected: %v, got: %v. Error: %v", tc.inputConfig, tc.result, c.Result.Valid, c.Result.Errors)
		}
	}
}

func TestValidateTestPatterns(t *testing.T) {
	type test struct {
		inputConfig string
		result      bool
	}

	tests := []test{
		{
			inputConfig: "test_patterns = 23",
			result:      false,
		},
		{
			inputConfig: "test_patterns = [23,43]",
			result:      false,
		},
		{
			inputConfig: "test_patterns = ['hello', 'world']",
			result:      true,
		},
		{
			inputConfig: "test_patterns = [\"hello\",\"world\"]",
			result:      true,
		},
		{
			inputConfig: "test_patterns = []",
			result:      true,
		},
		{
			inputConfig: "test_patterns = 'hello'",
			result:      false,
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

		c.validateTestPatterns()
		if !reflect.DeepEqual(tc.result, c.Result.Valid) {
			t.Fatalf("Config : %v, expected: %v, got: %v. Error: %v", tc.inputConfig, tc.result, c.Result.Valid, c.Result.Errors)
		}
	}
}

// Receives a string of DeepSource config and returns its
// representation in the form of a DSConfig struct
func getConfig(inputConfig []byte) (*DSConfig, error) {
	config := DSConfig{}
	viper.SetConfigType("toml")
	err := viper.ReadConfig(bytes.NewBuffer(inputConfig))
	if err != nil {
		return nil, err
	}
	// Unmarshaling the configdata into DSConfig struct
	viper.UnmarshalExact(&config)
	return &config, nil
}
