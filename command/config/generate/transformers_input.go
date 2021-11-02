package generate

import "github.com/deepsourcelabs/cli/utils"

// ==========
// Transformers Input Prompt
// ==========
func (o *Options) collectTransformersInput() (err error) {
	transformerPromptMsg := "Would you like to activate any Transformers for any languages?"
	transformerPromptHelpText := "DeepSource Transformers automatically help to achieve auto-formatting of code. Add a transformer by selecting the code formatting tool of your choice."

	o.ActivatedTransformers, err = utils.SelectFromMultipleOptions(transformerPromptMsg, transformerPromptHelpText, utils.TransformersData.TransformerNames)
	if err != nil {
		return err
	}

	return nil
}
