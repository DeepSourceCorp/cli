package generate

import "github.com/deepsourcelabs/cli/utils"

// Responsible for collecting user input for generating DeepSource config
func (o *Options) collectUserInput() error {

	// Get the list of analyzers and transformers supported by DeepSource
	err := utils.GetAnalyzersAndTransformersData()
	if err != nil {
		return err
	}

	// Get input for analyzers to be activated
	err = o.collectAnalyzerInput()
	if err != nil {
		return err
	}

	err = o.collectTransformersInput()
	if err != nil {
		return err
	}

	err = o.collectExcludePatterns()
	if err != nil {
		return err
	}

	err = o.collectTestPatterns()
	if err != nil {
		return err
	}

	return nil
}
