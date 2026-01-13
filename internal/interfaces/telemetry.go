package interfaces

import "time"

// TelemetryClient captures errors and events for diagnostics.
type TelemetryClient interface {
	Init(dsn string) error
	CaptureException(err error)
	CaptureMessage(msg string)
	ConfigureScope(f func(scope interface{}))
	Flush(timeout time.Duration)
}
