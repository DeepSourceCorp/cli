package diagnostics

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	"github.com/deepsourcelabs/cli/analyzers/validator"
	"github.com/morikuni/aec"
)

// fieldRegexp is a regular expression for checking the current line is a field or not.
var fieldRegexp = `\s*(?P<field>.+)\s*=\s*`

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
		codeframe += prefix + codeframeLine + "\n"
	}

	// Add the reconstructed codeframe to the final string representation.
	diagnosticMsg := fmt.Sprintf("%s\n%s", errMsg, codeframe)

	return diagnosticMsg
}

// readFileContent reads the file and returns its content.
func readFileContent(filename string) (string, error) {
	content, err := os.ReadFile(filename)
	if err != nil {
		return "", err
	}

	return string(content), nil
}

// getDiagnosticsFromFile uses the file content to return diagnostics with metadata like line number, content, etc.
func getDiagnosticsFromFile(filename string, errors []validator.ErrorMeta) []Diagnostic {
	fileContent, err := readFileContent(filename)
	if err != nil {
		return []Diagnostic{}
	}

	diagnostics := []Diagnostic{}

	lines := strings.Split(string(fileContent), "\n")

	// Iterate over each error and check line-by-line.
	for _, err := range errors {
		for lineNum, line := range lines {
			result := checkField(line, err.Field)
			if result {
				// If the line contains the field name, and if it doesn't have a comment prefix, then we can proceed to diagnostic generation.
				// if strings.Contains(line, err.Field) && !strings.HasPrefix(line, "#") {
				// Prepare code frame for the current line.
				codeFrame := prepareCodeFrame(lineNum, lines)

				// Get filename (base path) from absolute file path.
				filename := filepath.Base(filename)

				// Generate a diagnostic.
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

// prepareCodeFrame prepares a code frame using the file content. The code frame is meant to be displayed on the console while reporting diagnostics.
// NOTE: lineNum always starts from 0.
func prepareCodeFrame(lineNum int, lines []string) string {
	frame := ""

	if lineNum <= 1 {
		// Case 1: When the line is near the top of the file.
		// Generate a frame with the current and next line only.
		frame += aec.LightRedF.Apply(fmt.Sprintf("> %d | %s\n", lineNum+1, lines[lineNum]))
		frame += fmt.Sprintf("  %d | %s\n", lineNum+2, lines[lineNum+1])

	} else if lineNum >= (len(lines) - 1) {
		// Case 2: When the line is near the bottom of the file.
		// Generate a frame with the current line only.
		frame += aec.LightRedF.Apply(fmt.Sprintf("> %d | %s\n", lineNum, lines[lineNum-1]))
	} else {
		// Case 3: When the line is in between the top and the bottom.
		// Generate a frame with the the previous, current and the next line.
		frame += fmt.Sprintf("  %d | %s\n", lineNum, lines[lineNum-1])
		frame += aec.LightRedF.Apply(fmt.Sprintf("> %d | %s\n", lineNum+1, lines[lineNum]))
		frame += fmt.Sprintf("  %d | %s\n", lineNum+2, lines[lineNum+1])
	}

	return frame
}

// checkField checks if the line contains the field.
func checkField(line, field string) bool {
	// We use fieldRegexp for checking if the current line is a field or not.
	// If it's not a field, for example, comments for explanation, etc., then checkField should return false.
	exp := regexp.MustCompile(fieldRegexp)

	// Get index for the "field" named group.
	matches := exp.FindStringSubmatch(line)
	groupIndex := exp.SubexpIndex("field")

	// Capture match. We proceed only if the groupIndex isn't -1 (group not found), and if the number of matches aren't zero.
	// Once done, we populate match with the match found using the regular expression.
	match := ""
	if len(matches) != 0 && groupIndex != -1 {
		match = matches[groupIndex]
	}
	match = strings.TrimSpace(match)

	// Return true if the match contains the field.
	return strings.Contains(match, field)
}
