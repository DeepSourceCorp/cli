package secrets

import "errors"

var (
	ErrNotFound    = errors.New("secret not found")
	ErrUnavailable = errors.New("secrets store unavailable")
)

// Store provides secret storage primitives.
type Store interface {
	Get(key string) (string, error)
	Set(key string, value string) error
	Delete(key string) error
}

// NoopStore implements Store with no backing storage.
type NoopStore struct{}

func (NoopStore) Get(key string) (string, error) {
	return "", ErrUnavailable
}

func (NoopStore) Set(key string, value string) error {
	return ErrUnavailable
}

func (NoopStore) Delete(key string) error {
	return ErrUnavailable
}

// DefaultStore returns the best available store for the platform.
func DefaultStore() Store {
	return NewKeychainStore()
}
