package adapters

import (
	"errors"
	"net/http"
)

// MockHTTPClient is a configurable HTTP client for tests.
type MockHTTPClient struct {
	DoFunc func(req *http.Request) (*http.Response, error)
}

func NewMockHTTPClient() *MockHTTPClient {
	return &MockHTTPClient{}
}

func (m *MockHTTPClient) Do(req *http.Request) (*http.Response, error) {
	if m.DoFunc == nil {
		return nil, errors.New("mock http client: no DoFunc set")
	}
	return m.DoFunc(req)
}
