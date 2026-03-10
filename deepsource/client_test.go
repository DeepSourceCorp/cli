package deepsource

import "testing"

func TestNormalizeHostName(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"deepsource.com", "deepsource.com"},
		{"deepsource.io", "deepsource.com"},
		{"app.deepsource.com", "deepsource.com"},
		{"enterprise.example.com", "enterprise.example.com"},
	}
	for _, tt := range tests {
		if got := normalizeHostName(tt.input); got != tt.want {
			t.Errorf("normalizeHostName(%q) = %q, want %q", tt.input, got, tt.want)
		}
	}
}

func TestNewClientDefaultTransport(t *testing.T) {
	client, err := New(ClientOpts{
		Token:              "test-token",
		HostName:           "deepsource.com",
		InsecureSkipVerify: false,
	})
	if err != nil {
		t.Fatalf("unexpected error creating client: %v", err)
	}
	if client == nil {
		t.Fatal("expected non-nil client")
	}
}

func TestNewClientInsecureTransport(t *testing.T) {
	client, err := New(ClientOpts{
		Token:              "test-token",
		HostName:           "enterprise.example.com",
		InsecureSkipVerify: true,
	})
	if err != nil {
		t.Fatalf("unexpected error creating client with InsecureSkipVerify: %v", err)
	}
	if client == nil {
		t.Fatal("expected non-nil client")
	}
}

func TestGetAPIClientURL(t *testing.T) {
	tests := []struct {
		hostName string
		want     string
	}{
		{"deepsource.com", "https://api.deepsource.com/graphql/"},
		{"deepsource.io", "https://api.deepsource.com/graphql/"},
		{"app.deepsource.com", "https://api.deepsource.com/graphql/"},
		{"enterprise.example.com", "https://enterprise.example.com/api/graphql/"},
	}
	for _, tt := range tests {
		if got := getAPIClientURL(tt.hostName); got != tt.want {
			t.Errorf("getAPIClientURL(%q) = %q, want %q", tt.hostName, got, tt.want)
		}
	}
}
