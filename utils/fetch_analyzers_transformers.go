package utils

import (
	"context"

	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/analyzers"
	"github.com/deepsourcelabs/cli/deepsource/transformers"
)

// Options holds the metadata.
type AnalyzersData struct {
	AnalyzerNames      []string
	AnalyzerShortcodes []string
	AnalyzersMap       map[string]string // Map for {analyzer name : shortcode}
	AnalyzersMeta      []string
	AnalyzersData      []analyzers.Analyzer
}

type TransformersData struct {
	TransformerNames      []string
	TransformerShortcodes []string
	TransformerMap        map[string]string // Map for {transformer name:shortcode}
	TransformersData      []transformers.Transformer
}

var AnaData AnalyzersData
var TrData TransformersData

// Get the list of all the supported analyzers and transformers with
// their corresponding data like shortcode, metaschema etc.
func GetAnalyzersAndTransformersData() error {
	var err error
	// Fetch the client
	deepsource, err := deepsource.New()
	if err != nil {
		return err
	}
	ctx := context.Background()

	// Get supported analyzers and transformers data
	AnaData.AnalyzersMap = make(map[string]string)
	TrData.TransformerMap = make(map[string]string)

	AnaData.AnalyzersData, err = deepsource.GetSupportedAnalyzers(ctx)
	if err != nil {
		return err
	}

	TrData.TransformersData, err = deepsource.GetSupportedTransformers(ctx)
	if err != nil {
		return err
	}
	parseSDKResponse()
	return nil
}

// Parses the SDK response of analyzers and transformers data into the format required
// by the validator and generator package
func parseSDKResponse() {
	AnaData.AnalyzersMap = make(map[string]string)
	TrData.TransformerMap = make(map[string]string)

	for _, analyzer := range AnaData.AnalyzersData {
		AnaData.AnalyzerNames = append(AnaData.AnalyzerNames, analyzer.Name)
		AnaData.AnalyzerShortcodes = append(AnaData.AnalyzerShortcodes, analyzer.Shortcode)
		AnaData.AnalyzersMap[analyzer.Name] = analyzer.Shortcode
	}

	for _, transformer := range TrData.TransformersData {
		TrData.TransformerNames = append(TrData.TransformerNames, transformer.Name)
		TrData.TransformerShortcodes = append(TrData.TransformerShortcodes, transformer.Shortcode)
		TrData.TransformerMap[transformer.Name] = transformer.Shortcode
	}
}
