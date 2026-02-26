package report

import "testing"

func TestHostToEndpoint(t *testing.T) {
	tests := []struct {
		host string
		want string
	}{
		{"deepsource.com", "https://app.deepsource.com"},
		{"deepsource.io", "https://app.deepsource.com"},
		{"deepsource.one", "https://app.deepsource.one"},
		{"enterprise.example.com", "https://enterprise.example.com"},
	}
	for _, tt := range tests {
		t.Run(tt.host, func(t *testing.T) {
			if got := hostToEndpoint(tt.host); got != tt.want {
				t.Errorf("hostToEndpoint(%q) = %q, want %q", tt.host, got, tt.want)
			}
		})
	}
}
