package generate

import "github.com/deepsourcelabs/cli/api"

// Collects user input for generating DeepSource config
func (o *Options) collectUserInput() error {

	var err error
	o.AnalyzersMap = make(map[string]string)
	o.TransformerMap = make(map[string]string)

	o.AnalyzerNames, o.AnalyzerShortcodes, _,o.AnalyzersMap, err = api.GetSupportedAnalyzers(o.gqlClient)
	if err != nil {
		return err
	}

	o.TransformerNames, o.TransformerShortcodes, o.TransformerMap, err = api.GetSupportedTransformers(o.gqlClient)
	if err != nil {
		return err
	}

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
