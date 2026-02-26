package testutil

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLoadGoldenFile(t *testing.T) {
	// Create a temp file with known content.
	dir := t.TempDir()
	path := filepath.Join(dir, "test.json")
	content := []byte(`{"key": "value"}`)
	if err := os.WriteFile(path, content, 0o644); err != nil {
		t.Fatalf("failed to write temp file: %v", err)
	}

	got := LoadGoldenFile(t, path)
	if string(got) != string(content) {
		t.Errorf("LoadGoldenFile returned %q, want %q", got, content)
	}
}

func TestMockQueryFunc(t *testing.T) {
	// Create a golden file with a JSON object.
	dir := t.TempDir()
	path := filepath.Join(dir, "response.json")
	if err := os.WriteFile(path, []byte(`{"name":"test"}`), 0o644); err != nil {
		t.Fatalf("failed to write golden file: %v", err)
	}

	mock := MockQueryFunc(t, map[string]string{
		"GetIssues": path,
	})

	var result struct{ Name string }
	err := mock.QueryFunc(nil, "query GetIssues { ... }", nil, &result)
	if err != nil {
		t.Fatalf("QueryFunc returned error: %v", err)
	}
	if result.Name != "test" {
		t.Errorf("got Name=%q, want %q", result.Name, "test")
	}
}

func TestCreateTestConfigManager(t *testing.T) {
	mgr := CreateTestConfigManager(t, "test-token", "https://app.deepsource.com", "testuser")
	cfg, err := mgr.Load()
	if err != nil {
		t.Fatalf("failed to read config: %v", err)
	}
	if cfg.Token != "test-token" {
		t.Errorf("got Token=%q, want %q", cfg.Token, "test-token")
	}
	if cfg.Host != "https://app.deepsource.com" {
		t.Errorf("got Host=%q, want %q", cfg.Host, "https://app.deepsource.com")
	}
	if cfg.User != "testuser" {
		t.Errorf("got User=%q, want %q", cfg.User, "testuser")
	}
	if cfg.IsExpired() {
		t.Error("expected token to not be expired")
	}
}

func TestCreateExpiredTestConfigManager(t *testing.T) {
	mgr := CreateExpiredTestConfigManager(t, "expired-token", "https://app.deepsource.com", "testuser")
	cfg, err := mgr.Load()
	if err != nil {
		t.Fatalf("failed to read config: %v", err)
	}
	if cfg.Token != "expired-token" {
		t.Errorf("got Token=%q, want %q", cfg.Token, "expired-token")
	}
	if !cfg.IsExpired() {
		t.Error("expected token to be expired")
	}
}
