package generate

import (
	"context"

	"github.com/deepsourcelabs/cli/deepsource"
)

// Collects user input for generating DeepSource config
func (o *Options) collectUserInput() error {

	var err error

	// Declare a deepsource client
	deepsource := deepsource.New()
	ctx := context.Background()

	o.AnalyzersMap = make(map[string]string)
	o.TransformerMap = make(map[string]string)

	o.AnalyzerNames, o.AnalyzerShortcodes, _, o.AnalyzersMap, err = deepsource.GetSupportedAnalyzers(ctx)
	if err != nil {
		return err
	}

	o.TransformerNames, o.TransformerShortcodes, o.TransformerMap, err = deepsource.GetSupportedTransformers(ctx)
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
