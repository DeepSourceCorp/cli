package adapters

import "time"

// NoOpSentry is a stub sentry client for tests.
type NoOpSentry struct{}

func NewNoOpSentry() *NoOpSentry {
	return &NoOpSentry{}
}

func (*NoOpSentry) Init(_ string) error {
	return nil
}

func (*NoOpSentry) CaptureException(_ error) {}

func (*NoOpSentry) CaptureMessage(_ string) {}

func (*NoOpSentry) ConfigureScope(_ func(scope interface{})) {}

func (*NoOpSentry) Flush(_ time.Duration) {}
