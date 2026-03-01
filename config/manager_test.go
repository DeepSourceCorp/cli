package config

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/deepsourcelabs/cli/buildinfo"
	"github.com/deepsourcelabs/cli/internal/adapters"
	"github.com/pelletier/go-toml"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestManagerLoadFromFile(t *testing.T) {
	tempDir := t.TempDir()
	homeDir := func() (string, error) { return tempDir, nil }

	configDir := filepath.Join(tempDir, buildinfo.ConfigDirName)
	require.NoError(t, os.MkdirAll(configDir, 0o700))

	tomlData := `host = "app.deepsource.io"
user = "alice"
token = "file-token"
`
	require.NoError(t, os.WriteFile(filepath.Join(configDir, ConfigFileName), []byte(tomlData), 0o644))

	mgr := NewManager(adapters.NewOSFileSystem(), homeDir)
	cfg, err := mgr.Load()
	require.NoError(t, err)
	assert.Equal(t, "app.deepsource.io", cfg.Host)
	assert.Equal(t, "alice", cfg.User)
	assert.Equal(t, "file-token", cfg.Token)
}

func TestManagerLoadNoFile(t *testing.T) {
	tempDir := t.TempDir()
	homeDir := func() (string, error) { return tempDir, nil }

	mgr := NewManager(adapters.NewOSFileSystem(), homeDir)
	cfg, err := mgr.Load()
	require.NoError(t, err)
	assert.Empty(t, cfg.Host)
	assert.Empty(t, cfg.User)
	assert.Empty(t, cfg.Token)
}

func TestManagerWrite(t *testing.T) {
	tempDir := t.TempDir()
	homeDir := func() (string, error) { return tempDir, nil }

	mgr := NewManager(adapters.NewOSFileSystem(), homeDir)
	err := mgr.Write(&CLIConfig{
		Host: "example.com",
		User: "bob",
	})
	require.NoError(t, err)

	// Read back the raw TOML
	path := filepath.Join(tempDir, buildinfo.ConfigDirName, ConfigFileName)
	data, err := os.ReadFile(path)
	require.NoError(t, err)

	var got CLIConfig
	require.NoError(t, toml.Unmarshal(data, &got))
	assert.Equal(t, "example.com", got.Host)
	assert.Equal(t, "bob", got.User)
}

func TestManagerWriteStoresTokenInTOML(t *testing.T) {
	tempDir := t.TempDir()
	homeDir := func() (string, error) { return tempDir, nil }

	mgr := NewManager(adapters.NewOSFileSystem(), homeDir)
	err := mgr.Write(&CLIConfig{
		Host:  "example.com",
		Token: "super-secret",
	})
	require.NoError(t, err)

	// Token should be in the TOML file
	path := filepath.Join(tempDir, buildinfo.ConfigDirName, ConfigFileName)
	data, err := os.ReadFile(path)
	require.NoError(t, err)

	var got CLIConfig
	require.NoError(t, toml.Unmarshal(data, &got))
	assert.Equal(t, "super-secret", got.Token, "token should be written to TOML")
}

func TestManagerDelete(t *testing.T) {
	tempDir := t.TempDir()
	homeDir := func() (string, error) { return tempDir, nil }

	mgr := NewManager(adapters.NewOSFileSystem(), homeDir)

	// Write a config first
	require.NoError(t, mgr.Write(&CLIConfig{Host: "example.com", Token: "tok"}))

	// Delete it
	require.NoError(t, mgr.Delete())

	// File should be gone
	path := filepath.Join(tempDir, buildinfo.ConfigDirName, ConfigFileName)
	_, err := os.Stat(path)
	assert.True(t, os.IsNotExist(err), "config file should be deleted")
}

func TestManagerDeleteNonExistent(t *testing.T) {
	tempDir := t.TempDir()
	homeDir := func() (string, error) { return tempDir, nil }

	mgr := NewManager(adapters.NewOSFileSystem(), homeDir)
	err := mgr.Delete()
	assert.NoError(t, err, "deleting non-existent config should not error")
}

func TestManagerTokenRefreshCallback(t *testing.T) {
	tempDir := t.TempDir()
	homeDir := func() (string, error) { return tempDir, nil }

	mgr := NewManager(adapters.NewOSFileSystem(), homeDir)

	// Write initial config
	require.NoError(t, mgr.Write(&CLIConfig{Host: "example.com", User: "old@test.com", Token: "old-token"}))

	// Invoke the refresh callback
	cb := mgr.TokenRefreshCallback()
	cb("new-token", "2030-01-01T00:00:00Z", "new@test.com")

	// Reload and verify
	cfg, err := mgr.Load()
	require.NoError(t, err)
	assert.Equal(t, "new-token", cfg.Token)
	assert.Equal(t, "new@test.com", cfg.User)
	assert.False(t, cfg.TokenExpiresIn.IsZero(), "token expiry should be set")
}

func TestManagerLoadTokenFromEnv(t *testing.T) {
	tempDir := t.TempDir()
	homeDir := func() (string, error) { return tempDir, nil }

	t.Setenv("DEEPSOURCE_TOKEN", "env-token-123")

	mgr := NewManager(adapters.NewOSFileSystem(), homeDir)
	cfg, err := mgr.Load()
	require.NoError(t, err)
	assert.Equal(t, "env-token-123", cfg.Token)
	assert.True(t, cfg.TokenFromEnv)
}

func TestManagerLoadHostFromEnv(t *testing.T) {
	tempDir := t.TempDir()
	homeDir := func() (string, error) { return tempDir, nil }

	t.Setenv("DEEPSOURCE_HOST", "enterprise.example.com")

	mgr := NewManager(adapters.NewOSFileSystem(), homeDir)
	cfg, err := mgr.Load()
	require.NoError(t, err)
	assert.Equal(t, "enterprise.example.com", cfg.Host)
}

func TestManagerLoadFileOverEnv(t *testing.T) {
	tempDir := t.TempDir()
	homeDir := func() (string, error) { return tempDir, nil }

	// Write a config file with a token and host
	configDir := filepath.Join(tempDir, buildinfo.ConfigDirName)
	require.NoError(t, os.MkdirAll(configDir, 0o700))
	tomlData := `host = "file-host.example.com"
user = "alice"
token = "file-token"
`
	require.NoError(t, os.WriteFile(filepath.Join(configDir, ConfigFileName), []byte(tomlData), 0o644))

	// Set env vars that should be ignored because file takes priority
	t.Setenv("DEEPSOURCE_TOKEN", "env-token")
	t.Setenv("DEEPSOURCE_HOST", "env-host.example.com")

	mgr := NewManager(adapters.NewOSFileSystem(), homeDir)
	cfg, err := mgr.Load()
	require.NoError(t, err)
	assert.Equal(t, "file-token", cfg.Token)
	assert.Equal(t, "file-host.example.com", cfg.Host)
	assert.False(t, cfg.TokenFromEnv)
}

func TestManagerRefreshCallbackSkipsEnvToken(t *testing.T) {
	tempDir := t.TempDir()
	homeDir := func() (string, error) { return tempDir, nil }

	t.Setenv("DEEPSOURCE_TOKEN", "env-token")

	mgr := NewManager(adapters.NewOSFileSystem(), homeDir)

	cb := mgr.TokenRefreshCallback()
	cb("refreshed-token", "2030-01-01T00:00:00Z", "new@test.com")

	// Reload — should still be the env token, not the refreshed one
	cfg, err := mgr.Load()
	require.NoError(t, err)
	assert.Equal(t, "env-token", cfg.Token)
	assert.True(t, cfg.TokenFromEnv)
}

func TestNewManagerDefaults(t *testing.T) {
	homeDir := func() (string, error) { return "/tmp", nil }

	mgr := NewManager(adapters.NewOSFileSystem(), homeDir)
	assert.NotNil(t, mgr)
}
