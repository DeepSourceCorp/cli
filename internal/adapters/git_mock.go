package adapters

import "github.com/deepsourcelabs/cli/internal/interfaces"

// MockGitClient is a configurable git client for tests.
type MockGitClient struct {
	HeadOID string
	Warning string
	Err     error
	Remotes map[string]interfaces.RemoteInfo
}

func NewMockGitClient() *MockGitClient {
	return &MockGitClient{Remotes: make(map[string]interfaces.RemoteInfo)}
}

func (g *MockGitClient) SetHead(oid string, warning string) {
	g.HeadOID = oid
	g.Warning = warning
	g.Err = nil
}

func (g *MockGitClient) SetError(err error) {
	g.Err = err
}

func (g *MockGitClient) SetRemotes(remotes map[string]interfaces.RemoteInfo) {
	g.Remotes = remotes
}

func (g *MockGitClient) GetHead(_ string) (string, string, error) {
	return g.HeadOID, g.Warning, g.Err
}

func (g *MockGitClient) ListRemotes(_ string) (map[string]interfaces.RemoteInfo, error) {
	return g.Remotes, g.Err
}
