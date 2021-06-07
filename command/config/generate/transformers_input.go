package generate

import (
	"fmt"

	"github.com/AlecAivazis/survey/v2"
)

// ==========
// Transformers Prompt
// ==========
func (o *Options) collectTransformersInput(supportedAnalyzers []string, transformersMap map[string][]string) error {

	// Collect transformer choice for analyzers which user has selected (in question for the choice of analyzers)
	for _, selectedAnalyzer := range o.ActivatedAnalyzers {
		transformerOpts, ok := transformersMap[selectedAnalyzer]
		if !ok {
			continue
		}
		transformerQues := fmt.Sprintf("Which transformers would you like to activate for %s?", selectedAnalyzer)

		transformerPrompt := &survey.MultiSelect{
			Renderer: survey.Renderer{},
			Message:  transformerQues,
			Options:  transformerOpts,
			Help:     "DeepSource Transformers automatically help to achieve auto-formatting of code. Add a transformer by selecting the code formatting tool of your choice.",
			VimMode:  false,
		}
		err := survey.AskOne(transformerPrompt, &o.ActivatedTransformers)
		if err != nil {
			return err
		}
	}

	// Collecting names of transformers which have not been activated in a slice alongwith the
	// corresponding analyzer
	// Looks something like this - ["Black (Python)", "YAPF (Python)", "Prettier (JavaScript)"]
	var remainingTransformerOpts []string

	// Iterating over all the supported analyzers
	for _, analyzer := range supportedAnalyzers {
		alreadySelected := false
		for _, selectedAnalyzer := range o.ActivatedAnalyzers {

			// Filtering out the analyzers which user has already selected
			if analyzer == selectedAnalyzer {
				alreadySelected = true
				break
			}
		}

		// If the analyzer has not been selected, then fetch its transformers from the analyzer:transformers mapping
		// and append to remainingTransformers slice
		if alreadySelected == false {
			transformers, ok := transformersMap[analyzer]
			if ok {
				for _, transformer := range transformers {
					remainingTransformerOpts = append(remainingTransformerOpts, fmt.Sprintf("%s (%s)", transformer, analyzer))
				}
			}
		}
	}

	// Ask the user if he/she wants to activate any other transformers
	transformerQues := fmt.Sprintf("Would you like to activate any transformers for other languages?")

	transformerPrompt := &survey.MultiSelect{
		Renderer: survey.Renderer{},
		Message:  transformerQues,
		Options:  remainingTransformerOpts,
		Help:     "DeepSource Transformers automatically help to achieve auto-formatting of code. Add a transformer by selecting the code formatting tool of your choice.",
	}

	err := survey.AskOne(transformerPrompt, &o.ActivatedTransformers)
	if err != nil {
		return err
	}

	return nil
}
