package adapters

import (
	"net/http"
	"time"
)

// NewHTTPClient returns a configured HTTP client.
func NewHTTPClient(timeout time.Duration) *http.Client {
	return &http.Client{Timeout: timeout}
}
