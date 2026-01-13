package adapters

import (
	"time"

	"github.com/getsentry/sentry-go"
)

// SentryClient reports telemetry via sentry-go.
type SentryClient struct{}

func NewSentryClient() *SentryClient {
	return &SentryClient{}
}

func (s *SentryClient) Init(dsn string) error {
	return sentry.Init(sentry.ClientOptions{Dsn: dsn})
}

func (s *SentryClient) CaptureException(err error) {
	sentry.CaptureException(err)
}

func (s *SentryClient) CaptureMessage(msg string) {
	sentry.CaptureMessage(msg)
}

func (s *SentryClient) ConfigureScope(f func(scope interface{})) {
	sentry.ConfigureScope(func(scope *sentry.Scope) {
		f(scope)
	})
}

func (s *SentryClient) Flush(timeout time.Duration) {
	sentry.Flush(timeout)
}
