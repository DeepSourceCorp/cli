package errors

import (
	stderrors "errors"
	"fmt"
)

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

// UserError marks an error as user-correctable (bad input, missing config, etc.).
// These errors should not be reported to Sentry.
type UserError struct {
	Err error
}

func (e *UserError) Error() string {
	return e.Err.Error()
}

func (e *UserError) Unwrap() error {
	return e.Err
}

func NewUserError(err error) error {
	return &UserError{Err: err}
}

func NewUserErrorf(format string, args ...interface{}) error {
	return &UserError{Err: fmt.Errorf(format, args...)}
}

// IsUserError returns true if the error chain contains a UserError or a CLIError
// with a user-error code.
func IsUserError(err error) bool {
	var ue *UserError
	if stderrors.As(err, &ue) {
		return true
	}
	var ce *CLIError
	if stderrors.As(err, &ce) {
		return ce.Code.IsUserErrorCode()
	}
	return false
}

// IsUserErrorCode returns true for error codes that represent user-correctable problems.
func (c ErrorCode) IsUserErrorCode() bool {
	switch c {
	case ErrInvalidConfig, ErrAuthRequired, ErrAuthExpired, ErrInvalidDSN, ErrInvalidArtifact:
		return true
	}
	return false
}
