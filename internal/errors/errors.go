package errors

import (
	stderrors "errors"
	"fmt"

	"github.com/deepsourcelabs/cli/buildinfo"
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

// IsAuthError returns true for auth-related error codes.
func (c ErrorCode) IsAuthError() bool {
	return c == ErrAuthRequired || c == ErrAuthExpired
}

// ErrNotLoggedIn returns a CLIError for unauthenticated users.
func ErrNotLoggedIn() *CLIError {
	return NewCLIError(ErrAuthRequired,
		fmt.Sprintf("Not logged in. Run %q to authenticate", buildinfo.AppName+" auth login"),
		nil)
}

// ErrTokenExpired returns a CLIError for expired authentication.
func ErrTokenExpired(cause error) *CLIError {
	return NewCLIError(ErrAuthExpired,
		fmt.Sprintf("Authentication expired. Run %q to re-authenticate", buildinfo.AppName+" auth login"),
		cause)
}

// ErrAuthTimeout returns a CLIError for authentication timeouts.
func ErrAuthTimeout() *CLIError {
	return NewCLIError(ErrAuthRequired,
		fmt.Sprintf("Authentication timed out. Run %q to try again", buildinfo.AppName+" auth login"),
		nil)
}

// WrapAPIError wraps err in a CLIError with ErrAPIError code, unless the error
// chain already contains an auth error — in which case it returns the auth
// error directly so it isn't buried.
func WrapAPIError(message string, err error) error {
	var ce *CLIError
	if stderrors.As(err, &ce) && ce.Code.IsAuthError() {
		return ce
	}
	return NewCLIError(ErrAPIError, message, err)
}

// IsUserErrorCode returns true for error codes that represent user-correctable problems.
func (c ErrorCode) IsUserErrorCode() bool {
	switch c {
	case ErrInvalidConfig, ErrAuthRequired, ErrAuthExpired, ErrInvalidDSN, ErrInvalidArtifact:
		return true
	}
	return false
}
