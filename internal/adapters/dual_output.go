package adapters

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

// DualOutput writes user output to stdout and diagnostics to stderr (and optional log file).
type DualOutput struct {
	user io.Writer
	err  io.Writer
}

func NewDualOutput() *DualOutput {
	return &DualOutput{user: os.Stdout, err: os.Stderr}
}

// NewDualOutputWithDebug logs diagnostics to stderr and the debug log file.
func NewDualOutputWithDebug(logPath string) (*DualOutput, error) {
	logFile, err := os.OpenFile(logPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		return nil, err
	}

	return &DualOutput{
		user: os.Stdout,
		err:  io.MultiWriter(os.Stderr, logFile),
	}, nil
}

// NewDualOutputFromEnv enables diagnostic logging when DEEPSOURCE_CLI_DEBUG is set.
func NewDualOutputFromEnv() *DualOutput {
	debug := strings.TrimSpace(os.Getenv("DEEPSOURCE_CLI_DEBUG"))
	quiet := strings.TrimSpace(os.Getenv("DEEPSOURCE_CLI_QUIET"))
	if quiet != "" && quiet != "0" {
		output := NewDualOutput()
		output.user = io.Discard
		return output
	}
	if debug == "" {
		return NewDualOutput()
	}

	logPath := debug
	if debug == "1" || strings.EqualFold(debug, "true") {
		home, err := os.UserHomeDir()
		if err != nil {
			return NewDualOutput()
		}
		logPath = filepath.Join(home, ".deepsource", "cli-debug.log")
	}

	if logPath == "" {
		return NewDualOutput()
	}

	if err := os.MkdirAll(filepath.Dir(logPath), 0o755); err != nil {
		return NewDualOutput()
	}

	output, err := NewDualOutputWithDebug(logPath)
	if err != nil {
		return NewDualOutput()
	}

	return output
}

func (o *DualOutput) Write(p []byte) (n int, err error) {
	return o.user.Write(p)
}

func (o *DualOutput) WriteError(p []byte) (n int, err error) {
	return o.err.Write(p)
}

func (o *DualOutput) Printf(format string, a ...interface{}) {
	fmt.Fprintf(o.user, format, a...)
}

func (o *DualOutput) Errorf(format string, a ...interface{}) {
	fmt.Fprintf(o.err, format, a...)
}
