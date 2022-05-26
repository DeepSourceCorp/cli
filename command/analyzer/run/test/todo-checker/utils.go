package main

import (
	"encoding/json"
	"os"
	"path"
)

func createIssue(filePath string, lineNumber, _ int) {
	vcsPath := path.Base(filePath)
	actualLineNumber := lineNumber + 1

	// issue := Diagnostic{
	//     Code:  "I001",
	//     Title: "Possible TODO comment found",
	//     Location: Location{
	//         Path: vcsPath,
	//         Position: Position{
	//             Begin: Coordinate{
	//                 Line:   actualLineNumber,
	//                 Column: column,
	//             },
	//             End: Coordinate{
	//                 Line: actualLineNumber,
	//             },
	//         },
	//     },
	// }

	issue := Diagnostic{
		Code:    "I001",
		Message: "Found a TODO comment",
		Range: Range{
			Start: Position{
				Line: actualLineNumber,
			},
			End: Position{
				Line: actualLineNumber,
			},
		},
		RelatedInformation: []DiagnosticRelatedInformation{
			{
				Location: Location{
					URI: vcsPath,
					Range: Range{
						Start: Position{
							Line: actualLineNumber,
						},
						End: Position{
							Line: actualLineNumber,
						},
					},
				},
				Message: "Found a TODO comment",
			},
		},
	}
	issues = append(issues, issue)
}

func prepareResult() AnalysisResult {
	result := AnalysisResult{}
	result.Issues = issues
	result.IsPassed = false

	if len(issues) > 0 {
		result.IsPassed = true
	}

	return result
}

func writeMacroResult(result *AnalysisResult) error {
	resultJSON, err := json.Marshal(result)
	if err != nil {
		return err
	}

	return os.WriteFile(path.Join(toolboxPath, "analysis_results.json"), resultJSON, 0o777)
}
