package utils

import (
	"context"

	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/analyzers"
	"github.com/deepsourcelabs/cli/deepsource/transformers"
)

type DeepSourceAnalyzersData struct {
	AnalyzerNames      []string
	AnalyzerShortcodes []string
	AnalyzersMap       map[string]string // Map for {analyzer name : shortcode}
	AnalyzersMeta      []string
	AnalyzersMetaMap   map[string]string // Map for {analyzer name: analyzer meta-schema}
}

type DeepSourceTransformersData struct {
	TransformerNames      []string
	TransformerShortcodes []string
	TransformerMap        map[string]string // Map for {transformer name:shortcode}
}

var AnalyzersData DeepSourceAnalyzersData
var TransformersData DeepSourceTransformersData

var analyzersAPIResponse []analyzers.Analyzer
var transformersAPIResponse []transformers.Transformer

// Get the list of all the supported analyzers and transformers with
// their corresponding data like shortcode, metaschema etc.
func GetAnalyzersAndTransformersData(ctx context.Context, deepsource deepsource.Client) (err error) {
	// Get supported analyzers and transformers data
	AnalyzersData.AnalyzersMap = make(map[string]string)
	TransformersData.TransformerMap = make(map[string]string)

	analyzersAPIResponse, err = deepsource.GetSupportedAnalyzers(ctx)
	if err != nil {
		return err
	}

	transformersAPIResponse, err = deepsource.GetSupportedTransformers(ctx)
	if err != nil {
		return err
	}
	parseSDKResponse()
	return nil
}

// Parses the SDK response of analyzers and transformers data into the format required
// by the validator and generator package
func parseSDKResponse() {
	analyzersMap := make(map[string]string)
	analyzersMetaMap := make(map[string]string)
	transformersMap := make(map[string]string)

	for _, analyzer := range analyzersAPIResponse {
		analyzersMap[analyzer.Name] = analyzer.Shortcode
		analyzersMetaMap[analyzer.Shortcode] = analyzer.MetaSchema

		AnalyzersData = DeepSourceAnalyzersData{
			AnalyzerNames:      append(AnalyzersData.AnalyzerNames, analyzer.Name),
			AnalyzerShortcodes: append(AnalyzersData.AnalyzerShortcodes, analyzer.Shortcode),
			AnalyzersMap:       analyzersMap,
			AnalyzersMeta:      append(AnalyzersData.AnalyzersMeta, analyzer.MetaSchema),
			AnalyzersMetaMap:   analyzersMetaMap,
		}
	}

	for _, transformer := range transformersAPIResponse {
		transformersMap[transformer.Name] = transformer.Shortcode

		TransformersData = DeepSourceTransformersData{
			TransformerNames:      append(TransformersData.TransformerNames, transformer.Name),
			TransformerShortcodes: append(TransformersData.TransformerShortcodes, transformer.Shortcode),
			TransformerMap:        transformersMap,
		}
	}
}
