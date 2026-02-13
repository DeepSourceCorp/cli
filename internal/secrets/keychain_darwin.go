//go:build darwin

package secrets

import (
	"bytes"
	"os/exec"
	"strings"

	"github.com/deepsourcelabs/cli/buildinfo"
)

type keychainStore struct {
	service string
}

// NewKeychainStore returns a macOS keychain-backed store.
func NewKeychainStore() Store {
	return &keychainStore{service: buildinfo.KeychainSvc}
}

func (k *keychainStore) Get(key string) (string, error) {
	cmd := exec.Command("security", "find-generic-password", "-s", k.service, "-a", key, "-w")
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	output, err := cmd.Output()
	if err != nil {
		if strings.Contains(stderr.String(), "could not be found") {
			return "", ErrNotFound
		}
		return "", err
	}
	return strings.TrimSpace(string(output)), nil
}

func (k *keychainStore) Set(key string, value string) error {
	cmd := exec.Command("security", "add-generic-password", "-s", k.service, "-a", key, "-w", value, "-U")
	output, err := cmd.CombinedOutput()
	if err != nil {
		return err
	}
	_ = output
	return nil
}

func (k *keychainStore) Delete(key string) error {
	cmd := exec.Command("security", "delete-generic-password", "-s", k.service, "-a", key)
	output, err := cmd.CombinedOutput()
	if err != nil {
		if strings.Contains(string(output), "could not be found") {
			return ErrNotFound
		}
		return err
	}
	return nil
}
