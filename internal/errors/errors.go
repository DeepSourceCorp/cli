package errors

import "fmt"

// ErrorCode represents a CLI error category.
type ErrorCode int

const (
	ErrInvalidConfig ErrorCode = iota + 1
	ErrAuthRequired
	ErrAuthExpired
	ErrNetworkFailure
	ErrGitOperationFailed
	ErrInvalidDSN
	ErrInvalidArtifact
	ErrAPIError
)

// CLIError wraps an error with a code and message.
type CLIError struct {
	Code    ErrorCode
	Message string
	Cause   error
}

func (e *CLIError) Error() string {
	if e.Cause != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.Cause)
	}
	return e.Message
}

func (e *CLIError) ExitCode() int {
	return int(e.Code)
}

func (e *CLIError) Unwrap() error {
	return e.Cause
}

func NewCLIError(code ErrorCode, message string, cause error) *CLIError {
	return &CLIError{
		Code:    code,
		Message: message,
		Cause:   cause,
	}
}
