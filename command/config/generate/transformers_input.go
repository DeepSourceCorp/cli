package generate

import (
	"fmt"

	"github.com/AlecAivazis/survey/v2"
	"github.com/deepsourcelabs/cli/utils"
)

// ==========
// Transformers Input Prompt
// ==========
func (o *Options) collectTransformersInput() error {
	transformerQues := fmt.Sprintf("Would you like to activate any Transformers for any languages?")

	// Multi-select prompt for selecting transformers
	transformerPrompt := &survey.MultiSelect{
		Renderer: survey.Renderer{},
		Message:  transformerQues,
		Options:  utils.TrData.TransformerNames,
		Help:     "DeepSource Transformers automatically help to achieve auto-formatting of code. Add a transformer by selecting the code formatting tool of your choice.",
	}
	err := survey.AskOne(transformerPrompt, &o.ActivatedTransformers)
	if err != nil {
		return err
	}

	return nil
}
