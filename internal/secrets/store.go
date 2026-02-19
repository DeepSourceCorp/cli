package secrets

import "errors"

var (
	ErrNotFound    = errors.New("Secret not found")
	ErrUnavailable = errors.New("Secrets store unavailable")
)

// Store provides secret storage primitives.
type Store interface {
	Get(key string) (string, error)
	Set(key string, value string) error
	Delete(key string) error
}

// NoopStore implements Store with no backing storage.
type NoopStore struct{}

func (NoopStore) Get(_ string) (string, error) {
	return "", ErrUnavailable
}

func (NoopStore) Set(_ string, _ string) error {
	return ErrUnavailable
}

func (NoopStore) Delete(_ string) error {
	return ErrUnavailable
}

// DefaultStore returns the best available store for the platform.
func DefaultStore() Store {
	return NewKeychainStore()
}
