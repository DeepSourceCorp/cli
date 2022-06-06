package processor

import "github.com/deepsourcelabs/cli/types"

/* Converts the LSP based analysis results into the default format supported by DeepSource */
func (p *ProcessAnalysisResults) formatLSPResultsToDefault() {
	defaultAnalysisResult := types.DefaultAnalysisResult{
		Metrics:   p.AnalysisResult.Metrics,
		IsPassed:  p.AnalysisResult.IsPassed,
		Errors:    p.AnalysisResult.Errors,
		ExtraData: p.AnalysisResult.ExtraData,
	}
	for _, issue := range p.AnalysisResult.Issues {
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
	p.DefaultAnalysisResult = defaultAnalysisResult
}
