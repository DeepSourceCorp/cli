// TODO: add comments

package diagnostics

import (
	"os"
	"strings"

	"github.com/deepsourcelabs/cli/analyzers/validator"
	"github.com/fatih/color"
)

type Diagnostic struct {
	Line    int
	Column  int
	Content string

	ErrorMessage string
}

func GetDiagnostics(failure validator.ValidationFailure) ([]string, error) {
	diagnostics := []string{}

	fileContent, err := readFileContent(failure.File)
	if err != nil {
		return nil, err
	}

	diags := getDiagnosticsFromFile(fileContent, failure.Errors)

	for _, diag := range diags {
		message := getMessage(diag)
		diagnostics = append(diagnostics, message)
	}

	return diagnostics, nil
}

func getMessage(diag Diagnostic) string {
	errMsg := "\n"
	errMsg += color.RedString("At line number %d:\n", diag.Line)
	errMsg += color.BlueString(" >	%s \n", diag.Content)
	errMsg += color.RedString("ERROR: %s", diag.ErrorMessage)
	errMsg += "\n"

	return errMsg
}

func readFileContent(filename string) (string, error) {
	content, err := os.ReadFile(filename)
	if err != nil {
		return "", err
	}

	return string(content), nil
}

func getDiagnosticsFromFile(fileContent string, errors []validator.ErrorMeta) []Diagnostic {
	lines := strings.Split(string(fileContent), "\n")

	diagnostics := []Diagnostic{}

	for _, err := range errors {
		for lineNum, line := range lines {
			if strings.Contains(line, err.Field) {
				diag := Diagnostic{
					Line:         lineNum,
					Content:      line,
					ErrorMessage: err.Message,
				}

				diagnostics = append(diagnostics, diag)
			}
		}
	}

	return diagnostics
}
