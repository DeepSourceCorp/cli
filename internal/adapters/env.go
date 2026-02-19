package adapters

import (
	"os"
	"sync"
)

// RealEnvironment proxies to os environment variables.
type RealEnvironment struct{}

func NewRealEnvironment() *RealEnvironment {
	return &RealEnvironment{}
}

func (*RealEnvironment) Get(key string) string {
	return os.Getenv(key)
}

func (*RealEnvironment) Set(key string, value string) error {
	return os.Setenv(key, value)
}

func (*RealEnvironment) Lookup(key string) (string, bool) {
	return os.LookupEnv(key)
}

// MockEnvironment stores environment variables in memory.
type MockEnvironment struct {
	mu   sync.RWMutex
	data map[string]string
}

func NewMockEnvironment() *MockEnvironment {
	return &MockEnvironment{data: make(map[string]string)}
}

func (e *MockEnvironment) Get(key string) string {
	value, _ := e.Lookup(key)
	return value
}

func (e *MockEnvironment) Set(key string, value string) error {
	e.mu.Lock()
	defer e.mu.Unlock()
	e.data[key] = value
	return nil
}

func (e *MockEnvironment) Lookup(key string) (string, bool) {
	e.mu.RLock()
	defer e.mu.RUnlock()
	value, ok := e.data[key]
	return value, ok
}
