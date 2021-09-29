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

var AnalyzersAPIResponse []analyzers.Analyzer
var TransformersAPIResponse []transformers.Transformer

// Get the list of all the supported analyzers and transformers with
// their corresponding data like shortcode, metaschema etc.
func GetAnalyzersAndTransformersData(ctx context.Context, deepsource deepsource.Client) (err error) {
	// Get supported analyzers and transformers data
	AnalyzersData.AnalyzersMap = make(map[string]string)
	TransformersData.TransformerMap = make(map[string]string)

	AnalyzersAPIResponse, err = deepsource.GetSupportedAnalyzers(ctx)
	if err != nil {
		return err
	}

	TransformersAPIResponse, err = deepsource.GetSupportedTransformers(ctx)
	if err != nil {
		return err
	}
	parseSDKResponse()
	return nil
}

// Parses the SDK response of analyzers and transformers data into the format required
// by the validator and generator package
func parseSDKResponse() {
	AnalyzersData.AnalyzersMap = make(map[string]string)
	AnalyzersData.AnalyzersMetaMap = make(map[string]string)
	TransformersData.TransformerMap = make(map[string]string)

	for _, analyzer := range AnalyzersAPIResponse {
		AnalyzersData.AnalyzerNames = append(AnalyzersData.AnalyzerNames, analyzer.Name)
		AnalyzersData.AnalyzerShortcodes = append(AnalyzersData.AnalyzerShortcodes, analyzer.Shortcode)
		AnalyzersData.AnalyzersMeta = append(AnalyzersData.AnalyzersMeta, analyzer.MetaSchema)
		AnalyzersData.AnalyzersMap[analyzer.Name] = analyzer.Shortcode
		AnalyzersData.AnalyzersMetaMap[analyzer.Shortcode] = analyzer.MetaSchema
	}

	for _, transformer := range TransformersAPIResponse {
		TransformersData.TransformerNames = append(TransformersData.TransformerNames, transformer.Name)
		TransformersData.TransformerShortcodes = append(TransformersData.TransformerShortcodes, transformer.Shortcode)
		TransformersData.TransformerMap[transformer.Name] = transformer.Shortcode
	}
}
