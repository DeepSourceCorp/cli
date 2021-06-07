package generate

import "github.com/deepsourcelabs/cli/api"

// Collects user input for generating DeepSource config
func (o *Options) collectUserInput() error {

	o.AnalyzersMap = make(map[string]string)
	o.TransformerMap = make(map[string]string)

	analyzerData, err := api.GetSupportedAnalyzers(o.gqlClient)
	if err != nil {
		return err
	}

	transformersData, err := api.GetSupportedTransformers(o.gqlClient)
	if err != nil {
		return err
	}

	// Copying data into Options struct
	for _, edge := range analyzerData.Analyzers.Edges {
		o.AnalyzerNames = append(o.AnalyzerNames, edge.Node.Name)
		o.AnalyzerShortcodes = append(o.AnalyzerShortcodes, edge.Node.Shortcode)
		o.AnalyzersMap[edge.Node.Name] = edge.Node.Shortcode
	}

	for _, edge := range transformersData.Transformers.Edges {
		o.TransformerNames = append(o.TransformerNames, edge.Node.Name)
		o.TransformerShortcodes = append(o.TransformerShortcodes, edge.Node.Shortcode)
		o.TransformerMap[edge.Node.Name] = edge.Node.Shortcode
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
