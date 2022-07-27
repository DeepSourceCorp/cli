package diagnostics

import (
	"fmt"
	"path/filepath"
	"sort"
	"strings"

	"github.com/deepsourcelabs/cli/analyzers/validator"
	"github.com/morikuni/aec"
)

// FileDiagnostic represents the diagnostics present in a file.
type FileDiagnostic struct {
	Filename    string
	Diagnostics []Diagnostic
}

// Diagnostic represents a diagnostic reported by the validators.
type Diagnostic struct {
	Filename     string
	Line         int
	Codeframe    string
	ErrorMessage string
}

// GetDiagnostics returns diagnostics as strings.
func GetDiagnostics(failure validator.ValidationFailure) ([]string, error) {
	// Get diagnostics using the file's content.
	fileDiagnostics := getDiagnosticsFromFile(failure.File, failure.Errors)

	// Group diagnostics based on the filename.
	groupedDiagnostics := groupDiagnostics(fileDiagnostics)

	// Retrieve string representation of diagnostics.
	diagnostics := constructDiagnostics(groupedDiagnostics)

	return diagnostics, nil
}

// groupDiagnostics groups diagnostics based on the filename.
func groupDiagnostics(diagnostics []Diagnostic) []FileDiagnostic {
	var groupedDiagnostics []FileDiagnostic

	// Using a map is a clean way to group items.
	// The diagnostics are grouped using the map, with the key being the filename.
	groupedDiagnosticsMap := make(map[string][]Diagnostic)
	for _, diagnostic := range diagnostics {
		groupedDiagnosticsMap[diagnostic.Filename] = append(groupedDiagnosticsMap[diagnostic.Filename], diagnostic)
	}

	// Extract keys from the map.
	var keys []string
	for k := range groupedDiagnosticsMap {
		keys = append(keys, k)
	}
	// Sort keys lexicographically (ascending order).
	// This is done in order to ensure that the diagnostics get printed in ascending order, and not some random order.
	sort.Strings(keys)

	// Append diagnostics to the group.
	for _, filename := range keys {
		fileDiagnostic := FileDiagnostic{
			Filename:    filename,
			Diagnostics: groupedDiagnosticsMap[filename],
		}
		groupedDiagnostics = append(groupedDiagnostics, fileDiagnostic)
	}
	return groupedDiagnostics
}

// constructDiagnostics returns the string representations for multiple diagnostic groups.
func constructDiagnostics(fileDiagnostics []FileDiagnostic) []string {
	var diagnostics []string

	for _, group := range fileDiagnostics {
		groupMsg := constructGroup(group)
		diagnostics = append(diagnostics, groupMsg)
	}

	return diagnostics
}

// constructGroup returns the string representation for a group containing multiple diagnostics.
func constructGroup(fileDiagnostic FileDiagnostic) string {
	// Construct the section containing the filename.
	groupMsg := fmt.Sprintf("• %s\n", fileDiagnostic.Filename)

	// Construct multiple diagnostics.
	var diagnosticsMsg []string
	for _, diagnostic := range fileDiagnostic.Diagnostics {
		diagnosticMsg := constructDiagnostic(diagnostic)
		diagnosticsMsg = append(diagnosticsMsg, diagnosticMsg)
	}

	// Add grouped diagnostics to the final string representation.
	groupMsg += strings.Join(diagnosticsMsg, "\n")

	return groupMsg
}

// constructDiagnostic returns the diagnostic as a pretty-printed string.
func constructDiagnostic(diag Diagnostic) string {
	// The prefix is set to 2 spaces.
	prefix := "  "

	// Add error message to the string representation.
	errMsg := prefix + aec.LightRedF.Apply(diag.ErrorMessage)

	// Re-construct the codeframe for adding the prefix (indentation).
	codeframeLines := strings.Split(diag.Codeframe, "\n")
	var codeframe string
	for _, codeframeLine := range codeframeLines {
		// Ignore empty lines.
		// This is added for safety. This doesn't have a significant effect on the users' console, but it reflects while testing, debugging whitespace additions can be frustrating.
		if codeframeLine != "" {
			codeframe += prefix + codeframeLine + "\n"
		}
	}

	// Add the reconstructed codeframe to the final string representation.
	diagnosticMsg := fmt.Sprintf("%s\n%s", errMsg, codeframe)

	return diagnosticMsg
}

// getDiagnosticsFromFile uses the file content to return diagnostics with metadata like line number, content, etc.
func getDiagnosticsFromFile(filename string, errors []validator.ErrorMeta) []Diagnostic {
	fileContent, err := readFileContent(filename)
	if err != nil {
		return []Diagnostic{}
	}

	diagnostics := []Diagnostic{}

	// Get filename (base path) from absolute file path and get its lines data post trimming any
	// trailing spaces.
	filename = filepath.Base(filename)
	lines := strings.Split(strings.TrimRight(fileContent, " "), "\n")

	// Iterate over each error and check line-by-line.
	for _, err := range errors {
		for lineNum, line := range lines {

			// Case 1: If the field is empty, do NOT render the codeframe.
			if err.Field == "" {
				diag := Diagnostic{
					Filename:     filename,
					Line:         lineNum,
					Codeframe:    "",
					ErrorMessage: err.Message,
				}
				diagnostics = append(diagnostics, diag)
				break
			}

			// Case 2: Check if the invalid field pointed by the error is present
			// in the current line. If yes, prepare its codeframe.
			if checkField(line, err.Field) {
				// Prepare code frame for the current line.
				codeFrame := prepareCodeFrame(lineNum, lines)

				diag := Diagnostic{
					Filename:     filename,
					Line:         lineNum,
					Codeframe:    codeFrame,
					ErrorMessage: err.Message,
				}
				diagnostics = append(diagnostics, diag)
			}
		}
	}
	return diagnostics
}
