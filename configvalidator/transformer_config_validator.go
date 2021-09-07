package configvalidator

import (
	"fmt"
	"reflect"

	"github.com/deepsourcelabs/cli/utils"
	"github.com/spf13/viper"
)

// Validates Transformers Config
func (c *ConfigValidator) validateTransformersConfig() {
	// If no transformer activated by user, return without any errors
	if viper.Get("transformers") == nil {
		return
	}

	// Transformers should be an array
	transformersType := reflect.TypeOf(c.Config.Transformers).Kind().String()
	if transformersType != "slice" {
		c.pushError(fmt.Sprintf("Value of `transformers` should be an array. Found: %v", transformersType))
	}

	// Enabled property should be of boolean type
	for _, transformer := range c.Config.Transformers {
		enabledType := reflect.TypeOf(transformer.Enabled).Kind().String()
		if enabledType != "bool" {
			c.pushError(fmt.Sprintf("The `enabled` property should be of boolean type. Found: %v", enabledType))
		}
	}

	// ==== Transformer shortcode validation ====
	supported := false
	for _, activatedTransformer := range c.Config.Transformers {
		for _, supportedTransformer := range utils.TrData.TransformerShortcodes {
			if activatedTransformer.Name == supportedTransformer {
				supported = true
				break
			}
		}
		if !supported {
			c.pushError(fmt.Sprintf("The Tranformer %s is not supported yet.", activatedTransformer.Name))
		}
	}
}
