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
		valid       bool
	}

	tests := map[string]test{
		"valid config": {
			inputConfig: "version = 1",
			valid:       true,
		},
		"wrong version": {
			inputConfig: "version = \"foobar\"",
			valid:       false,
		},
		"version greater than maximum allowed": {
			inputConfig: "version = 352",
			valid:       false,
		},
		"version missing": {
			inputConfig: "",
			valid:       false,
		},
		"version of wrong type": {
			inputConfig: "version = \"2\"",
			valid:       false,
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
			c.validateVersion()
			if !reflect.DeepEqual(tc.valid, c.Result.Valid) {
				t.Fatalf("%v: expected: %v, got: %v. Error: %v", testName, tc.valid, c.Result.Valid, c.Result.Errors)
			}
		})
	}
}

func TestValidateExcludePatterns(t *testing.T) {
	type test struct {
		inputConfig string
		valid       bool
	}

	tests := map[string]test{
		"valid exclude_patterns": {
			inputConfig: "version= 1\nexclude_patterns = 23",
			valid:       false,
		},
		"should be array of string": {
			inputConfig: "version= 1\nexclude_patterns = [23,43]",
			valid:       false,
		},
		"valid array of string": {
			inputConfig: "version = 1\nexclude_patterns = ['hello', 'world']",
			valid:       true,
		},
		"strings with double quotes": {
			inputConfig: "exclude_patterns = [\"hello\",\"world\"]",
			valid:       true,
		},
		"empty exclude_patterns": {
			inputConfig: "exclude_patterns = []",
			valid:       true,
		},
		"cannot be only string, should be an array": {
			inputConfig: "version = 1\nexclude_patterns = 'hello'",
			valid:       false,
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
			c.validateExcludePatterns()
			if !reflect.DeepEqual(tc.valid, c.Result.Valid) {
				t.Fatalf("%v: Config : %v, expected: %v, got: %v. Error: %v", testName, tc.inputConfig, tc.valid, c.Result.Valid, c.Result.Errors)
			}
		})
	}
}

func TestValidateTestPatterns(t *testing.T) {
	type test struct {
		inputConfig string
		valid       bool
	}

	tests := map[string]test{
		"cannot be an integer": {
			inputConfig: "test_patterns = 23",
			valid:       false,
		},
		"cannot be an array of integers": {
			inputConfig: "test_patterns = [23,43]",
			valid:       false,
		},
		"should be array of strings": {
			inputConfig: "test_patterns = ['hello', 'world']",
			valid:       true,
		},
		"strings with double quotes": {
			inputConfig: "test_patterns = [\"hello\",\"world\"]",
			valid:       true,
		},
		"empty test_patterns": {
			inputConfig: "test_patterns = []",
			valid:       true,
		},
		"cannot be only string, should be an array of string": {
			inputConfig: "test_patterns = 'hello'",
			valid:       false,
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
			c.validateTestPatterns()
			if !reflect.DeepEqual(tc.valid, c.Result.Valid) {
				t.Fatalf("%v: Config : %v, expected: %v, got: %v. Error: %v", testName, tc.inputConfig, tc.valid, c.Result.Valid, c.Result.Errors)
			}
		})
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
