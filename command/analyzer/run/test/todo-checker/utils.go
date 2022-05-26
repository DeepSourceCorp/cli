package main

import (
	"encoding/json"
	"log"
	"os"
	"path"
	"strings"

	"github.com/karrick/godirwalk"
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

func writeMacroResult(result AnalysisResult) error {
	resultJSON, err := json.Marshal(result)
	if err != nil {
		return err
	}

	return os.WriteFile(path.Join(toolboxPath, "analysis_results.json"), resultJSON, 0o777)
}

// getAllFiles walks through the code directory and logs all the files
func getAllFiles() ([]string, error) {
	fileCount := 0

	allFiles := make([]string, 0)
	if err := godirwalk.Walk(codePath, &godirwalk.Options{
		Callback: func(osPathname string, de *godirwalk.Dirent) error {
			// Following string operation is not most performant way
			// of doing this, but common enough to warrant a simple
			// example here:
			if strings.Contains(osPathname, ".git") {
				return godirwalk.SkipThis
			}
			if !de.IsDir() {
				allFiles = append(allFiles, osPathname)
				fileCount++
			}
			return nil
		},
		Unsorted: true, // (optional) set true for faster yet non-deterministic enumeration (see godoc)
	}); err != nil {
		return nil, err
	}
	log.Println("Total files: ", fileCount)
	return allFiles, nil
}
