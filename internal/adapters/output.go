package adapters

import (
	"bytes"
	"fmt"
	"io"
	"os"
)

// StdOutput writes user-facing and error output to stdout/stderr.
type StdOutput struct {
	Out io.Writer
	Err io.Writer
}

func NewStdOutput() *StdOutput {
	return &StdOutput{Out: os.Stdout, Err: os.Stderr}
}

func (o *StdOutput) Write(p []byte) (n int, err error) {
	return o.Out.Write(p)
}

func (o *StdOutput) WriteError(p []byte) (n int, err error) {
	return o.Err.Write(p)
}

func (o *StdOutput) Printf(format string, a ...interface{}) {
	fmt.Fprintf(o.Out, format, a...)
}

func (o *StdOutput) Errorf(format string, a ...interface{}) {
	fmt.Fprintf(o.Err, format, a...)
}

// BufferOutput captures output in memory for tests.
type BufferOutput struct {
	Out bytes.Buffer
	Err bytes.Buffer
}

func NewBufferOutput() *BufferOutput {
	return &BufferOutput{}
}

func (o *BufferOutput) Write(p []byte) (n int, err error) {
	return o.Out.Write(p)
}

func (o *BufferOutput) WriteError(p []byte) (n int, err error) {
	return o.Err.Write(p)
}

func (o *BufferOutput) Printf(format string, a ...interface{}) {
	fmt.Fprintf(&o.Out, format, a...)
}

func (o *BufferOutput) Errorf(format string, a ...interface{}) {
	fmt.Fprintf(&o.Err, format, a...)
}

func (o *BufferOutput) String() string {
	return o.Out.String()
}

func (o *BufferOutput) ErrorString() string {
	return o.Err.String()
}
