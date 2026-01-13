package interfaces

import "net/http"

// HTTPClient abstracts http.Client for dependency injection.
type HTTPClient interface {
	Do(req *http.Request) (*http.Response, error)
}
