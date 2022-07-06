package push

import (
	"os"
	"testing"
)

func TestGetImageRegistryURL(t *testing.T) {
	tests := []struct {
		registryURL string
		want        string
	}{
		{
			registryURL: "us.gcr.io/deepsource-dev",
			want:        "us.gcr.io/deepsource-dev",
		},
		{
			registryURL: "",
			want:        "registry.deepsource.io",
		},
	}

	for _, tt := range tests {
		t.Run(tt.registryURL, func(t *testing.T) {
			if tt.registryURL != "" {
				os.Setenv("REGISTRY_URL", tt.registryURL)
			}
			if got := getImageRegistryURL(); got != tt.want {
				t.Errorf("Incorrect registry URL. Got = %v, want %v", got, tt.want)
			}
			os.Unsetenv("REGISTRY_URL")
		})
	}
}
