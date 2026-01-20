package generate

import (
	"github.com/deepsourcelabs/cli/internal/cli/prompt"
	"github.com/deepsourcelabs/cli/internal/configdata"
)

// ==========
// Transformers Input Prompt
// ==========
func (o *Options) collectTransformersInput() (err error) {
	transformerPromptMsg := "Would you like to activate any Transformers for any languages?"
	transformerPromptHelpText := "DeepSource Transformers automatically help to achieve auto-formatting of code. Add a transformer by selecting the code formatting tool of your choice."

	o.ActivatedTransformers, err = prompt.SelectFromMultipleOptions(transformerPromptMsg, transformerPromptHelpText, configdata.TransformersData.TransformerNames)
	if err != nil {
		return err
	}

	return nil
}
