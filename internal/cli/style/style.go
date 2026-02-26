package style

import (
	"fmt"
	"io"
	"strings"
	"unicode"
	"unicode/utf8"

	"github.com/pterm/pterm"
)

// capitalize uppercases the first character of s.
func capitalize(s string) string {
	if s == "" {
		return s
	}
	r, size := utf8.DecodeRuneInString(s)
	return string(unicode.ToUpper(r)) + s[size:]
}

// Badge printers (write to the supplied io.Writer)

// Errorf prints an error message with a red ✗ prefix.
func Errorf(w io.Writer, format string, a ...interface{}) {
	msg := capitalize(fmt.Sprintf(format, a...))
	fmt.Fprintln(w, pterm.Red("✗ Error: "+msg))
}

// Infof prints an informational note with a "Note:" prefix (uncolored).
func Infof(w io.Writer, format string, a ...interface{}) {
	msg := capitalize(fmt.Sprintf(format, a...))
	fmt.Fprintln(w, "> Note: "+msg)
}

// Warnf prints a warning message with a yellow ! prefix.
func Warnf(w io.Writer, format string, a ...interface{}) {
	msg := capitalize(fmt.Sprintf(format, a...))
	fmt.Fprintln(w, pterm.Yellow("! Warning: "+msg))
}

// Successf prints a success message with a green ✓ prefix.
func Successf(w io.Writer, format string, a ...interface{}) {
	msg := capitalize(fmt.Sprintf(format, a...))
	fmt.Fprintln(w, pterm.Green("✓ Success: "+msg))
}

// Color helpers (return strings, no I/O)

// IssueSeverityColor colors text by issue severity (CRITICAL / MAJOR / MINOR).
func IssueSeverityColor(sev, text string) string {
	switch strings.ToUpper(sev) {
	case "CRITICAL":
		return pterm.Red(text)
	case "MAJOR":
		return pterm.LightRed(text)
	case "MINOR":
		return pterm.Yellow(text)
	default:
		return text
	}
}

// VulnSeverityColor colors text by vulnerability severity (CRITICAL / HIGH / MEDIUM / LOW).
func VulnSeverityColor(sev, text string) string {
	switch strings.ToUpper(sev) {
	case "CRITICAL":
		return pterm.Red(text)
	case "HIGH":
		return pterm.LightRed(text)
	case "MEDIUM":
		return pterm.Yellow(text)
	case "LOW":
		return pterm.Blue(text)
	default:
		return text
	}
}

// GradeColor colors text by letter grade (A–F).
func GradeColor(grade string) string {
	switch {
	case strings.HasPrefix(grade, "A"):
		return pterm.Green(grade)
	case strings.HasPrefix(grade, "B"):
		return pterm.LightGreen(grade)
	case strings.HasPrefix(grade, "C"):
		return pterm.Yellow(grade)
	case strings.HasPrefix(grade, "D"):
		return pterm.LightRed(grade)
	default:
		return pterm.Red(grade)
	}
}

// RunStatusColor colors text by run status string.
func RunStatusColor(status string) string {
	switch strings.ToUpper(status) {
	case "SUCCESS":
		return pterm.Green("Success")
	case "FAILURE":
		return pterm.Red("Failure")
	case "PENDING":
		return pterm.Yellow("Pending")
	case "RUNNING":
		return pterm.Cyan("Running")
	default:
		return status
	}
}

func Yellow(format string, a ...interface{}) string {
	return pterm.Yellow(fmt.Sprintf(format, a...))
}

func Cyan(format string, a ...interface{}) string {
	return pterm.Cyan(fmt.Sprintf(format, a...))
}

// Pluralize returns singular when count is 1, plural otherwise.
func Pluralize(count int, singular, plural string) string {
	if count == 1 {
		return singular
	}
	return plural
}
