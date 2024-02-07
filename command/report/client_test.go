package report

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestClient_CompressionEnabled(t *testing.T) {
	tests := []struct {
		name        string
		response    string
		responseErr bool
		want        bool
		wantErr     bool
	}{
		{
			name:     "compression enabled",
			response: `{"data":{"__type":{"inputFields":[{"name":"compressed"}]}}}`,
			want:     true,
			wantErr:  false,
		},
		{
			name:     "compression disabled",
			response: `{"data":{"__type":{"inputFields":[{"name":"not_compressed"}]}}}`,
			want:     false,
			wantErr:  false,
		},
		{
			name:        "error",
			responseErr: true,
			want:        false,
			wantErr:     true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if tt.responseErr {
					w.WriteHeader(http.StatusInternalServerError)
					return
				}
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				if _, err := w.Write([]byte(tt.response)); err != nil {
					t.Error(err)
				}
			}))

			client := NewGraphQLClient(server.URL, false)
			got, err := client.CompressionEnabled()
			if (err != nil) != tt.wantErr {
				t.Errorf("Client.CompressionEnabled() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("Client.CompressionEnabled() = %v, want %v", got, tt.want)
			}
		})
	}
}
