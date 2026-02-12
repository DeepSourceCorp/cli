package adapters

import (
	"fmt"
	"io"
	"os"
)

// DualOutput writes user output to stdout and diagnostics to stderr (and optional log file).
type DualOutput struct {
	user io.Writer
	err  io.Writer
}

func NewDualOutput() *DualOutput {
	return &DualOutput{user: os.Stdout, err: os.Stderr}
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
