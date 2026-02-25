package graphqlclient

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"testing"
)

type stubTransport struct {
	statusCode int
	body       string
}

func (s *stubTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	return &http.Response{
		StatusCode: s.statusCode,
		Body:       io.NopCloser(strings.NewReader(s.body)),
		Request:    req,
	}, nil
}

func TestStatusCheckTransport_Success(t *testing.T) {
	transport := &StatusCheckTransport{
		Base: &stubTransport{statusCode: 200, body: `{"data":{}}`},
	}
	req, _ := http.NewRequest("POST", "https://api.deepsource.com/graphql/", http.NoBody)
	resp, err := transport.RoundTrip(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.StatusCode != 200 {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
}

func TestStatusCheckTransport_Non2xx(t *testing.T) {
	tests := []struct {
		name       string
		statusCode int
	}{
		{"404", 404},
		{"500", 500},
		{"302", 302},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			transport := &StatusCheckTransport{
				Base: &stubTransport{statusCode: tt.statusCode, body: "not graphql"},
			}
			req, _ := http.NewRequest("POST", "https://example.com/api/graphql/", http.NoBody)
			_, err := transport.RoundTrip(req)
			if err == nil {
				t.Fatal("expected error for non-2xx status")
			}
			if !strings.Contains(err.Error(), "unexpected HTTP") {
				t.Errorf("unexpected error message: %v", err)
			}
		})
	}
}

func TestIsTokenExpired(t *testing.T) {
	tests := []struct {
		err  string
		want bool
	}{
		{"Signature has expired", true},
		{"unexpected HTTP 401 from api.deepsource.com", true},
		{"unexpected HTTP 500 from api.deepsource.com", false},
		{"connection refused", false},
	}
	for _, tt := range tests {
		if got := isTokenExpired(fmt.Errorf("%s", tt.err)); got != tt.want {
			t.Errorf("isTokenExpired(%q) = %v, want %v", tt.err, got, tt.want)
		}
	}
}
