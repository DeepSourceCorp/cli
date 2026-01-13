package config

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/deepsourcelabs/cli/internal/adapters"
	"github.com/deepsourcelabs/cli/internal/secrets"
	"github.com/stretchr/testify/assert"
	"gopkg.in/yaml.v3"
)

type fakeSecretStore struct {
	data map[string]string
}

func (f *fakeSecretStore) Get(key string) (string, error) {
	value, ok := f.data[key]
	if !ok {
		return "", secrets.ErrNotFound
	}
	return value, nil
}

func (f *fakeSecretStore) Set(key string, value string) error {
	f.data[key] = value
	return nil
}

func (f *fakeSecretStore) Delete(key string) error {
	delete(f.data, key)
	return nil
}

func TestManagerLoadYAML(t *testing.T) {
	tempDir := t.TempDir()
	homeDir := func() (string, error) { return tempDir, nil }

	configPath := filepath.Join(tempDir, ".deepsource-cli.yaml")
	data := []byte("host: deepsource.io\nuser: demo\ntoken: demo-token\n")
	assert.NoError(t, os.WriteFile(configPath, data, 0o644))

	mgr := NewManagerWithSecrets(adapters.NewOSFileSystem(), homeDir, secrets.NoopStore{}, "test-key")
	cfg, err := mgr.Load()
	assert.NoError(t, err)
	assert.Equal(t, "deepsource.io", cfg.Host)
	assert.Equal(t, "demo", cfg.User)
	assert.Equal(t, "demo-token", cfg.Token)
}

func TestManagerWriteYAML(t *testing.T) {
	tempDir := t.TempDir()
	homeDir := func() (string, error) { return tempDir, nil }

	configPath := filepath.Join(tempDir, ".deepsource-cli.yaml")
	assert.NoError(t, os.WriteFile(configPath, []byte("host: placeholder\n"), 0o644))

	mgr := NewManagerWithSecrets(adapters.NewOSFileSystem(), homeDir, secrets.NoopStore{}, "test-key")
	cfg := &CLIConfig{Host: "deepsource.io", User: "demo", Token: "demo-token"}
	assert.NoError(t, mgr.Write(cfg))

	content, err := os.ReadFile(configPath)
	assert.NoError(t, err)

	var out CLIConfig
	assert.NoError(t, yaml.Unmarshal(content, &out))
	assert.Equal(t, cfg.Host, out.Host)
	assert.Equal(t, cfg.User, out.User)
	assert.Equal(t, cfg.Token, out.Token)
}

func TestManagerLoadTokenFromSecrets(t *testing.T) {
	tempDir := t.TempDir()
	homeDir := func() (string, error) { return tempDir, nil }
	store := &fakeSecretStore{data: map[string]string{"token-key": "secret-token"}}

	mgr := NewManagerWithSecrets(adapters.NewOSFileSystem(), homeDir, store, "token-key")
	cfg, err := mgr.Load()
	assert.NoError(t, err)
	assert.Equal(t, "secret-token", cfg.Token)
}
