package configvalidator

import (
	"fmt"
	"reflect"
	"strconv"

	"github.com/spf13/viper"
)

// Generic Config :
// - Version
// - Exclude_Patterns
// - Test_Patterns

func (c *ConfigValidator) validateVersion() {

	// ======== Version Validation ========

	// Version is mandatory
	if viper.Get("version") == nil {
		c.pushError("Property `version` is mandatory.")
	} else {
		// Value of version must be an integer
		if reflect.TypeOf(viper.Get("version")).Kind().String() != "int64" {
			c.pushError(fmt.Sprintf("Value of `version` must be an integer. Got %s", reflect.TypeOf(viper.Get("version")).Kind().String()))
			return
		}

		// Should not be zero
		versionInt, _ := strconv.Atoi(viper.GetString("version"))
		if versionInt < 1 {
			c.pushError(fmt.Sprintf("Value for `version` cannot be less than 1. Got %d", versionInt))
		}

		// Value for version must be less than ALLOWED VERSION
		if versionInt > MAX_ALLOWED_VERSION {
			c.pushError(fmt.Sprintf("Value for `version` cannot be greater than %d. Got %d", MAX_ALLOWED_VERSION, versionInt))
		}
	}
}

func (c *ConfigValidator) validateExcludePatterns() {

	// ======== Exclude Patterns Validation ========

	excludePatterns := viper.Get("exclude_patterns")

	// Sometimes the user doesn't add `exclude_patterns` to the code
	// Validate only if excludePatterns present
	if excludePatterns != nil {

		// Must be a slice of string
		exPatternType := reflect.TypeOf(excludePatterns).Kind().String()
		if exPatternType != "slice" {
			c.pushError(fmt.Sprintf("Value of `exclude_patterns` should be an array of strings. Found: %v", exPatternType))
			return
		}

		// Value of each exclude pattern can only be a string
		for _, ex_pattern := range c.Config.ExcludePatterns {
			if reflect.TypeOf(ex_pattern).Kind().String() != "string" {
				c.pushError(fmt.Sprintf("Value of `exclude_patterns` paths can only be string. Found: %v", reflect.TypeOf(ex_pattern).Kind().String()))
			}
		}
	}
}

func (c *ConfigValidator) validateTestPatterns() {

	// ======== Test Patterns Validation ========
	testPatterns := viper.Get("test_patterns")

	// Sometimes the user doesn't add `test_patterns` to the code
	// Validate only if testPatterns present
	if testPatterns != nil {

		// Must be a slice
		testPatternType := reflect.TypeOf(testPatterns).Kind().String()
		if testPatternType != "slice" {
			c.pushError(fmt.Sprintf("Value of `test_patterns` should be an array of objects. Found: %v", testPatternType))
		}

		// Value of each test pattern can only be a string
		for _, test_pattern := range c.Config.TestPatterns {
			if reflect.TypeOf(test_pattern).Kind().String() != "string" {
				c.pushError(fmt.Sprintf("Value of `test_pattern` paths can only be string. Found %v", reflect.TypeOf(test_pattern).Kind().String()))
			}
		}
	}
}

// Validates generic DeepSource config
func (c *ConfigValidator) validateGenericConfig() {

	c.validateVersion()
	c.validateExcludePatterns()
	c.validateTestPatterns()

}
