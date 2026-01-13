package auth

import (
	"testing"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/internal/adapters"
	"github.com/deepsourcelabs/cli/internal/secrets"
	"github.com/stretchr/testify/assert"
)

func TestServiceSaveLoadDeleteConfig(t *testing.T) {
	tempDir := t.TempDir()
	homeDir := func() (string, error) { return tempDir, nil }
	mgr := config.NewManagerWithSecrets(adapters.NewOSFileSystem(), homeDir, secrets.NoopStore{}, "test-key")
	svc := NewService(mgr)

	cfg := &config.CLIConfig{Host: "deepsource.io", User: "demo", Token: "demo-token"}
	assert.NoError(t, svc.SaveConfig(cfg))

	loaded, err := svc.LoadConfig()
	assert.NoError(t, err)
	assert.Equal(t, cfg.Host, loaded.Host)
	assert.Equal(t, cfg.User, loaded.User)
	assert.Equal(t, cfg.Token, loaded.Token)

	assert.NoError(t, svc.DeleteConfig())
	loaded, err = svc.LoadConfig()
	assert.NoError(t, err)
	assert.Empty(t, loaded.Token)
}
