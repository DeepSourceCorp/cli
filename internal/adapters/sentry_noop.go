package adapters

import "time"

// NoOpSentry is a stub sentry client for tests.
type NoOpSentry struct{}

func NewNoOpSentry() *NoOpSentry {
	return &NoOpSentry{}
}

func (n *NoOpSentry) Init(dsn string) error {
	return nil
}

func (n *NoOpSentry) CaptureException(err error) {}

func (n *NoOpSentry) CaptureMessage(msg string) {}

func (n *NoOpSentry) ConfigureScope(f func(scope interface{})) {}

func (n *NoOpSentry) Flush(timeout time.Duration) {}
