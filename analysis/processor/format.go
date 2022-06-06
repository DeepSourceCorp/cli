package processor

import "github.com/deepsourcelabs/cli/types"

/* Converts the LSP based analysis results into the default format supported by DeepSource */
func (*ProcessAnalysisResults) formatLSPResultsToDefault(analysisResult types.AnalysisResult) types.DefaultAnalysisResult {
	defaultAnalysisResult := types.DefaultAnalysisResult{
		Metrics:   analysisResult.Metrics,
		IsPassed:  analysisResult.IsPassed,
		Errors:    analysisResult.Errors,
		ExtraData: analysisResult.ExtraData,
	}
	for _, issue := range analysisResult.Issues {
		analysisIssue := types.Issue{
			Code:  issue.Code,
			Title: issue.Message,
			Location: types.Location{
				Path: issue.RelatedInformation[0].Location.URI,
				Position: types.Position{
					Begin: types.Coordinate{
						Line:   issue.Range.Start.Line,
						Column: issue.Range.Start.Character,
					},
					End: types.Coordinate{
						Line:   issue.Range.End.Line,
						Column: issue.Range.End.Character,
					},
				},
			},
		}
		defaultAnalysisResult.Issues = append(defaultAnalysisResult.Issues, analysisIssue)
	}
	return defaultAnalysisResult
}
