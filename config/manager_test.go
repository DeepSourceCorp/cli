package config

import (
	"testing"

	"github.com/deepsourcelabs/cli/internal/adapters"
	"github.com/deepsourcelabs/cli/internal/secrets"
	"github.com/stretchr/testify/assert"
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

func TestManagerLoadTokenFromSecrets(t *testing.T) {
	tempDir := t.TempDir()
	homeDir := func() (string, error) { return tempDir, nil }
	store := &fakeSecretStore{data: map[string]string{"token-key": "secret-token"}}

	mgr := NewManagerWithSecrets(adapters.NewOSFileSystem(), homeDir, store, "token-key")
	cfg, err := mgr.Load()
	assert.NoError(t, err)
	assert.Equal(t, "secret-token", cfg.Token)
}
