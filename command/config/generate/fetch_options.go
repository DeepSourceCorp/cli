package generate

import (
	"context"

	"github.com/deepsourcelabs/cli/deepsource"
)

// Get the list of all the supported analyzers and transformers with
// their corresponding data like shortcode, metaschema etc.
func (o *Options) getAnalyzersAndTransformersData() error {
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

	return nil
}

// Parses the SDK response of analyzers and transformers data into the format required
// by this (generate) package
func (o *Options) parseSDKResponse() {

	o.AnalyzersMap = make(map[string]string)
	o.TransformerMap = make(map[string]string)

	// Parse and format the Analyzers data
	for _, analyzer := range o.AnalyzersData {
		o.AnalyzerNames = append(o.AnalyzerNames, analyzer.Name)
		o.AnalyzerShortcodes = append(o.AnalyzerShortcodes, analyzer.Shortcode)
		o.AnalyzersMap[analyzer.Name] = analyzer.Shortcode
	}

	// Parse and format the Transformers data
	for _, transformer := range o.TransformersData {
		o.TransformerNames = append(o.TransformerNames, transformer.Name)
		o.TransformerShortcodes = append(o.TransformerShortcodes, transformer.Shortcode)
		o.TransformerMap[transformer.Name] = transformer.Shortcode
	}
}
