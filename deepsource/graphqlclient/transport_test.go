package graphqlclient

import (
	"context"
	"errors"
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

// --- GraphQLError tests ---

func TestGraphQLError_Error(t *testing.T) {
	err := &GraphQLError{
		Operation: "query",
		Query:     "{ viewer { login } }",
		Cause:     fmt.Errorf("connection refused"),
	}
	want := "GraphQL query failed: connection refused"
	if got := err.Error(); got != want {
		t.Errorf("Error() = %q, want %q", got, want)
	}
}

func TestGraphQLError_Unwrap(t *testing.T) {
	cause := fmt.Errorf("root cause")
	err := &GraphQLError{Operation: "mutation", Cause: cause}
	if err.Unwrap() != cause {
		t.Error("Unwrap() should return the cause")
	}
}

// --- TruncateQuery tests ---

func TestTruncateQuery_Short(t *testing.T) {
	q := "{ viewer { login } }"
	if got := TruncateQuery(q); got != q {
		t.Errorf("short query should be returned as-is, got %q", got)
	}
}

func TestTruncateQuery_Long(t *testing.T) {
	q := strings.Repeat("a", 150)
	got := TruncateQuery(q)
	if len(got) != 102 { // 100 + ".."
		t.Errorf("expected length 102, got %d", len(got))
	}
	if !strings.HasSuffix(got, "..") {
		t.Errorf("expected '..' suffix, got %q", got)
	}
}

func TestTruncateQuery_Exact100(t *testing.T) {
	q := strings.Repeat("b", 100)
	if got := TruncateQuery(q); got != q {
		t.Error("100-char query should be returned as-is")
	}
}

// --- wrapper tests ---

func TestNew(t *testing.T) {
	client := New("https://api.deepsource.com/graphql/", "tok")
	if client == nil {
		t.Fatal("New() returned nil")
	}
}

func TestSetAuthToken(t *testing.T) {
	client := New("https://api.deepsource.com/graphql/", "old-token")
	client.SetAuthToken("new-token")
	// Verify via the wrapper's internal state
	w, ok := client.(*wrapper)
	if !ok {
		t.Fatal("expected *wrapper type")
	}
	if w.token != "new-token" {
		t.Errorf("token = %q, want %q", w.token, "new-token")
	}
}

func TestMockClient_QueryDelegation(t *testing.T) {
	called := false
	mock := NewMockClient()
	mock.QueryFunc = func(ctx context.Context, query string, vars map[string]any, result any) error {
		called = true
		if query != "{ viewer }" {
			t.Errorf("query = %q, want %q", query, "{ viewer }")
		}
		return nil
	}

	err := mock.Query(context.Background(), "{ viewer }", nil, nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !called {
		t.Error("QueryFunc was not called")
	}
}

func TestMockClient_MutateDelegation(t *testing.T) {
	wantErr := errors.New("mutation failed")
	mock := NewMockClient()
	mock.MutateFunc = func(ctx context.Context, mutation string, vars map[string]any, result any) error {
		return wantErr
	}

	err := mock.Mutate(context.Background(), "mutation { ... }", nil, nil)
	if err != wantErr {
		t.Errorf("err = %v, want %v", err, wantErr)
	}
}

func TestMockClient_NilFuncs(t *testing.T) {
	mock := NewMockClient()
	// Nil QueryFunc/MutateFunc should return nil
	if err := mock.Query(context.Background(), "", nil, nil); err != nil {
		t.Errorf("nil QueryFunc should return nil, got %v", err)
	}
	if err := mock.Mutate(context.Background(), "", nil, nil); err != nil {
		t.Errorf("nil MutateFunc should return nil, got %v", err)
	}
}

func TestMockClient_SetAuthToken(t *testing.T) {
	mock := NewMockClient()
	mock.SetAuthToken("test-token")
	if mock.token != "test-token" {
		t.Errorf("token = %q, want %q", mock.token, "test-token")
	}
}
