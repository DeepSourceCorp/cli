package issues

import (
	"testing"
)

func TestNormalizeEnumValue(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"bug-risk", "BUG_RISK"},
		{"anti-pattern", "ANTI_PATTERN"},
		{"security", "SECURITY"},
		{"critical", "CRITICAL"},
		{" bug-risk ", "BUG_RISK"},
		{"ANTI-PATTERN", "ANTI_PATTERN"},
		{"ai", "AI"},
		{"static", "STATIC"},
	}
	for _, tt := range tests {
		got := normalizeEnumValue(tt.input)
		if got != tt.want {
			t.Errorf("normalizeEnumValue(%q) = %q, want %q", tt.input, got, tt.want)
		}
	}
}
