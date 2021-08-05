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

	o.AnalyzersData, err = deepsource.GetSupportedAnalyzers(ctx)
	if err != nil {
		return err
	}

	o.TransformersData, err = deepsource.GetSupportedTransformers(ctx)
	if err != nil {
		return err
	}

	o.parseSDKResponse()

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

func (o *Options) parseSDKResponse() {

	o.AnalyzersMap = make(map[string]string)
	o.TransformerMap = make(map[string]string)

	for _, analyzer := range o.AnalyzersData {
		o.AnalyzerNames = append(o.AnalyzerNames, analyzer.Name)
		o.AnalyzerShortcodes = append(o.AnalyzerShortcodes, analyzer.Shortcode)
		o.AnalyzersMap[analyzer.Name] = analyzer.Shortcode
	}

	for _, transformer := range o.TransformersData {
		o.TransformerNames = append(o.TransformerNames, transformer.Name)
		o.TransformerShortcodes = append(o.TransformerShortcodes, transformer.Shortcode)
		o.TransformerMap[transformer.Name] = transformer.Shortcode
	}
}
