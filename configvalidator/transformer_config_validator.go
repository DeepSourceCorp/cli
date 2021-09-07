package configvalidator

import (
	"fmt"

	"github.com/deepsourcelabs/cli/utils"
	"github.com/spf13/viper"
)

// Validates Transformer Config
func (c *ConfigValidator) validateTransformersConfig() {

	// If no transformer activated by user, return without any errors
	if viper.Get("transformers") == nil {
		return
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
