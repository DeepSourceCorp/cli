package main

import (
	"encoding/json"
	"os"
	"path"
	"strings"
)

// createIssue creates the issue.
func createIssue(filePath string, lineNumber, column int) {
	vcsPath := strings.TrimPrefix(filePath, codePath)
	actualLineNumber := lineNumber + 1

	issue := Issue{
		Code:  "I001",
		Title: "Possible TODO comment found",
		Location: Location{
			Path: vcsPath,
			Position: Position{
				Begin: Coordinate{
					Line:   actualLineNumber,
					Column: column,
				},
				End: Coordinate{
					Line: actualLineNumber,
				},
			},
		},
	}
	issues = append(issues, issue)
}

func createDummyIssue(filePath string, lineNumber, column int) {
	vcsPath := strings.TrimPrefix(filePath, codePath)
	actualLineNumber := lineNumber + 1

	issue := Issue{
		Code:  "I002",
		Title: "This is a demo issue",
		Location: Location{
			Path: vcsPath,
			Position: Position{
				Begin: Coordinate{
					Line:   actualLineNumber,
					Column: column,
				},
				End: Coordinate{
					Line: actualLineNumber,
				},
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

func writeMacroResult(result AnalysisResult) error {
	resultJSON, err := json.Marshal(result)
	if err != nil {
		return err
	}

	f, err := os.Create(path.Join(toolboxPath, "analysis_results.json"))
	if err != nil {
		return err
	}

	defer f.Close()
	if _, err2 := f.Write(resultJSON); err2 != nil {
		return err
	}
	return nil
}
