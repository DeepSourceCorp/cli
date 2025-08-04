package configvalidator

import (
	"bytes"
	"fmt"
	"strings"

	"github.com/spf13/viper"
)

const (
	MAX_ALLOWED_VERSION = 1
)

type Result struct {
	Valid           bool
	Errors          []string
	ConfigReadError bool
}

// Struct to store the meta (Config) and output (Result) of config validation
type ConfigValidator struct {
	Config DSConfig
	Result Result
}

// Entrypoint to the package `configvalidator`
// Accepts DeepSource config as a parameter and validates it
func (c *ConfigValidator) ValidateConfig(inputConfig []byte) Result {
	// Base cases
	c.Result.Valid = true
	c.Result.ConfigReadError = false

	// Making a "config" struct based on DSConfig to store the DeepSource config
	config := DSConfig{}
	viper.SetConfigType("toml")
	err := viper.ReadConfig(bytes.NewBuffer(inputConfig))
	if err != nil {
		// Error while reading config
		c.Result.Valid = false
		c.Result.Errors = append(c.Result.Errors, err.Error())
		c.Result.ConfigReadError = true
		return c.Result
	}
	// Unmarshaling the configdata into DSConfig struct
	err = viper.UnmarshalExact(&config)
	if err != nil {
		// Check if the error is due to invalid enabled field types
		if strings.Contains(err.Error(), "enabled") {
			c.Result.Valid = false
			c.Result.Errors = append(c.Result.Errors, "The `enabled` property should be of boolean type (true/false)")
			return c.Result
		}
		// Other unmarshaling errors
		c.Result.Valid = false
		c.Result.Errors = append(c.Result.Errors, fmt.Sprintf("Error while parsing config: %v", err))
		return c.Result
	}
	c.Config = config

	// Validate generic config which applies to all analyzers and transformers
	// Includes : Version, Exclude Patterns, Test Patterns
	c.validateGenericConfig()

	// Validate the Analyzers configuration
	c.validateAnalyzersConfig()

	// Validate the Transformers configuration
	c.validateTransformersConfig()
	return c.Result
}

// Utility function to push result string into the "ConfigValidator" struct
func (c *ConfigValidator) pushError(errorString string) {
	c.Result.Errors = append(c.Result.Errors, errorString)
	c.Result.Valid = false
}
