package interfaces

// OutputWriter handles user-facing and diagnostic output.
type OutputWriter interface {
	Write(p []byte) (n int, err error)
	WriteError(p []byte) (n int, err error)
	Printf(format string, a ...interface{})
	Errorf(format string, a ...interface{})
}
