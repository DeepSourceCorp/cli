package adapters

import "time"

// NoOpTelemetry is a stub telemetry client for tests.
type NoOpTelemetry struct{}

func NewNoOpTelemetry() *NoOpTelemetry {
	return &NoOpTelemetry{}
}

func (n *NoOpTelemetry) Init(dsn string) error {
	return nil
}

func (n *NoOpTelemetry) CaptureException(err error) {}

func (n *NoOpTelemetry) CaptureMessage(msg string) {}

func (n *NoOpTelemetry) ConfigureScope(f func(scope interface{})) {}

func (n *NoOpTelemetry) Flush(timeout time.Duration) {}
