package interfaces

import "time"

// SentryClient captures errors and events for diagnostics.
type SentryClient interface {
	Init(dsn string) error
	CaptureException(err error)
	CaptureMessage(msg string)
	ConfigureScope(f func(scope interface{}))
	Flush(timeout time.Duration)
}
