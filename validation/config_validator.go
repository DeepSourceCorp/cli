package validation

import (
	"bytes"

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

// Entrypoint to the package `validation`
// Accepts a string of deepsource config and validates it
func (c *ConfigValidator) ValidateConfig(inputConfig []byte) Result {

	// Making a "config" struct based on DSConfig to store the DeepSource config
	config := DSConfig{}

	// Base case. Optimism++
	c.Result.Valid = true

	// Unmarshaling the received config into "config" struct based on DSConfig
	viper.SetConfigType("toml")
	err := viper.ReadConfig(bytes.NewBuffer(inputConfig))
	if err != nil {
		// Error while reading config
		c.Result.Valid = false
		c.Result.Errors = append(c.Result.Errors, err.Error())
		c.Result.ConfigReadError = true
		return c.Result
	}

	// Now since viper has read the config successfully, we won't have the chance
	// of a "ConfigReadError"
	c.Result.ConfigReadError = false

	// Unmarshaling the configdata into DSConfig struct
	viper.UnmarshalExact(&config)
	c.Config = config

	// Validate generic config which applies to all analyzers and transformers
	// Example: Version, Exclude Patterns, Test Patterns
	c.validateGenericConfig()

	// Validate the analyzers related config
	c.validateAnalyzersConfig()

	// Validate the transformers related config
	c.validateTransformersConfig()

	return c.Result
}

// Utility function to push result string into the "ConfigValidator" struct
func (c *ConfigValidator) pushError(errorString string) {
	c.Result.Errors = append(c.Result.Errors, errorString)
	c.Result.Valid = false
}
