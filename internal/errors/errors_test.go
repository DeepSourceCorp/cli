package errors

import (
	"errors"
	"fmt"
	"strings"
	"testing"
)

func TestCLIError_Error_WithCause(t *testing.T) {
	err := NewCLIError(ErrAPIError, "request failed", fmt.Errorf("timeout"))
	if got := err.Error(); got != "request failed: timeout" {
		t.Errorf("got %q, want %q", got, "request failed: timeout")
	}
}

func TestCLIError_Error_WithoutCause(t *testing.T) {
	err := NewCLIError(ErrAPIError, "request failed", nil)
	if got := err.Error(); got != "request failed" {
		t.Errorf("got %q, want %q", got, "request failed")
	}
}

func TestCLIError_ExitCode(t *testing.T) {
	tests := []struct {
		code ErrorCode
		want int
	}{
		{ErrInvalidConfig, 1},
		{ErrAuthRequired, 2},
		{ErrAuthExpired, 3},
		{ErrNetworkFailure, 4},
		{ErrGitOperationFailed, 5},
		{ErrInvalidDSN, 6},
		{ErrInvalidArtifact, 7},
		{ErrAPIError, 8},
	}
	for _, tt := range tests {
		err := NewCLIError(tt.code, "msg", nil)
		if got := err.ExitCode(); got != tt.want {
			t.Errorf("ExitCode() for code %d = %d, want %d", tt.code, got, tt.want)
		}
	}
}

func TestCLIError_Unwrap(t *testing.T) {
	cause := fmt.Errorf("root cause")
	err := NewCLIError(ErrAPIError, "msg", cause)
	if err.Unwrap() != cause {
		t.Error("Unwrap() should return the cause")
	}

	err2 := NewCLIError(ErrAPIError, "msg", nil)
	if err2.Unwrap() != nil {
		t.Error("Unwrap() should return nil when no cause")
	}
}

func TestNewCLIError(t *testing.T) {
	cause := fmt.Errorf("oops")
	err := NewCLIError(ErrNetworkFailure, "network down", cause)
	if err.Code != ErrNetworkFailure {
		t.Errorf("Code = %d, want %d", err.Code, ErrNetworkFailure)
	}
	if err.Message != "network down" {
		t.Errorf("Message = %q, want %q", err.Message, "network down")
	}
	if err.Cause != cause {
		t.Error("Cause not set correctly")
	}
}

func TestUserError(t *testing.T) {
	inner := fmt.Errorf("bad input")
	ue := NewUserError(inner)
	if ue.Error() != "bad input" {
		t.Errorf("Error() = %q, want %q", ue.Error(), "bad input")
	}
	if errors.Unwrap(ue) != inner {
		t.Error("Unwrap() should return inner error")
	}
}

func TestNewUserErrorf(t *testing.T) {
	ue := NewUserErrorf("invalid %s: %d", "count", 42)
	if got := ue.Error(); got != "invalid count: 42" {
		t.Errorf("Error() = %q, want %q", got, "invalid count: 42")
	}
}

func TestIsUserError(t *testing.T) {
	tests := []struct {
		name string
		err  error
		want bool
	}{
		{"UserError", NewUserError(fmt.Errorf("bad")), true},
		{"CLIError with user code", NewCLIError(ErrInvalidConfig, "bad config", nil), true},
		{"CLIError with auth code", NewCLIError(ErrAuthRequired, "not logged in", nil), true},
		{"CLIError with non-user code", NewCLIError(ErrNetworkFailure, "timeout", nil), false},
		{"CLIError with API error code", NewCLIError(ErrAPIError, "api fail", nil), false},
		{"plain error", fmt.Errorf("generic"), false},
		{"wrapped UserError", fmt.Errorf("wrap: %w", NewUserError(fmt.Errorf("inner"))), true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := IsUserError(tt.err); got != tt.want {
				t.Errorf("IsUserError() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestErrorCode_IsAuthError(t *testing.T) {
	authCodes := map[ErrorCode]bool{
		ErrAuthRequired: true,
		ErrAuthExpired:  true,
	}
	allCodes := []ErrorCode{
		ErrInvalidConfig, ErrAuthRequired, ErrAuthExpired,
		ErrNetworkFailure, ErrGitOperationFailed, ErrInvalidDSN,
		ErrInvalidArtifact, ErrAPIError,
	}
	for _, c := range allCodes {
		if got := c.IsAuthError(); got != authCodes[c] {
			t.Errorf("ErrorCode(%d).IsAuthError() = %v, want %v", c, got, authCodes[c])
		}
	}
}

func TestErrorCode_IsUserErrorCode(t *testing.T) {
	userCodes := map[ErrorCode]bool{
		ErrInvalidConfig:  true,
		ErrAuthRequired:   true,
		ErrAuthExpired:    true,
		ErrInvalidDSN:     true,
		ErrInvalidArtifact: true,
	}
	allCodes := []ErrorCode{
		ErrInvalidConfig, ErrAuthRequired, ErrAuthExpired,
		ErrNetworkFailure, ErrGitOperationFailed, ErrInvalidDSN,
		ErrInvalidArtifact, ErrAPIError,
	}
	for _, c := range allCodes {
		if got := c.IsUserErrorCode(); got != userCodes[c] {
			t.Errorf("ErrorCode(%d).IsUserErrorCode() = %v, want %v", c, got, userCodes[c])
		}
	}
}

func TestErrNotLoggedIn(t *testing.T) {
	err := ErrNotLoggedIn()
	if err.Code != ErrAuthRequired {
		t.Errorf("Code = %d, want %d", err.Code, ErrAuthRequired)
	}
	if !strings.Contains(err.Message, "Not logged in") {
		t.Errorf("Message should contain 'Not logged in', got %q", err.Message)
	}
	if err.Cause != nil {
		t.Error("Cause should be nil")
	}
}

func TestErrTokenExpired(t *testing.T) {
	cause := fmt.Errorf("expired")
	err := ErrTokenExpired(cause)
	if err.Code != ErrAuthExpired {
		t.Errorf("Code = %d, want %d", err.Code, ErrAuthExpired)
	}
	if !strings.Contains(err.Message, "expired") {
		t.Errorf("Message should contain 'expired', got %q", err.Message)
	}
	if err.Cause != cause {
		t.Error("Cause should be set")
	}
}

func TestErrAuthTimeout(t *testing.T) {
	err := ErrAuthTimeout()
	if err.Code != ErrAuthRequired {
		t.Errorf("Code = %d, want %d", err.Code, ErrAuthRequired)
	}
	if !strings.Contains(err.Message, "timed out") {
		t.Errorf("Message should contain 'timed out', got %q", err.Message)
	}
}

func TestWrapAPIError_NormalError(t *testing.T) {
	cause := fmt.Errorf("connection refused")
	err := WrapAPIError("api call failed", cause)
	var ce *CLIError
	if !errors.As(err, &ce) {
		t.Fatal("expected CLIError")
	}
	if ce.Code != ErrAPIError {
		t.Errorf("Code = %d, want %d", ce.Code, ErrAPIError)
	}
	if ce.Cause != cause {
		t.Error("Cause should be the original error")
	}
}

func TestWrapAPIError_AuthError(t *testing.T) {
	authErr := ErrTokenExpired(fmt.Errorf("expired"))
	err := WrapAPIError("api call failed", authErr)
	var ce *CLIError
	if !errors.As(err, &ce) {
		t.Fatal("expected CLIError")
	}
	if ce.Code != ErrAuthExpired {
		t.Errorf("Code = %d, want %d — auth error should pass through", ce.Code, ErrAuthExpired)
	}
}
