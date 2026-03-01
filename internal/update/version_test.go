package update

import "testing"

func TestIsNewer(t *testing.T) {
	tests := []struct {
		name    string
		current string
		remote  string
		want    bool
		wantErr bool
	}{
		{"same version", "2.0.3", "2.0.3", false, false},
		{"patch bump", "2.0.3", "2.0.4", true, false},
		{"minor bump", "2.0.3", "2.1.0", true, false},
		{"major bump", "2.0.3", "3.0.0", true, false},
		{"older patch", "2.0.4", "2.0.3", false, false},
		{"older minor", "2.1.0", "2.0.9", false, false},
		{"older major", "3.0.0", "2.9.9", false, false},
		{"v prefix current", "v2.0.3", "2.0.4", true, false},
		{"v prefix remote", "2.0.3", "v2.0.4", true, false},
		{"v prefix both", "v2.0.3", "v2.0.4", true, false},
		{"invalid current", "abc", "2.0.4", false, true},
		{"invalid remote", "2.0.3", "xyz", false, true},
		{"two parts", "2.0", "2.0.1", false, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := IsNewer(tt.current, tt.remote)
			if (err != nil) != tt.wantErr {
				t.Errorf("IsNewer() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("IsNewer(%q, %q) = %v, want %v", tt.current, tt.remote, got, tt.want)
			}
		})
	}
}
