//go:build !darwin

package secrets

// NewKeychainStore returns a no-op store on unsupported platforms.
func NewKeychainStore() Store {
	return NoopStore{}
}
