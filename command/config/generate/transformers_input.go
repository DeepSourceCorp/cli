package generate

import "github.com/deepsourcelabs/cli/utils"

// ==========
// Transformers Input Prompt
// ==========
func (o *Options) collectTransformersInput() (err error) {
	transformerPromptMsg := "Would you like to activate any Transformers for any languages?"
	transformerPromptHelpText := "DeepSource Transformers automatically help to achieve auto-formatting of code. Add a transformer by selecting the code formatting tool of your choice."

	response, err := utils.ConfirmFromUser(transformerPromptMsg, transformerPromptHelpText)
	if err != nil {
		return err
	}

	if response {
		o.ActivatedTransformers, err = utils.SelectFromMultipleOptions("Which transformers would you like to use?", "You can select multiple transformers at the same time", utils.TransformersData.TransformerNames)
		if err != nil {
			return err
		}
	}

	return nil
}
