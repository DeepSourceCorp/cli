package interfaces

import "os"

// RemoteInfo describes a parsed git remote.
type RemoteInfo struct {
	Owner       string
	RepoName    string
	Provider    string
	DisplayName string
}

// FileSystem defines filesystem operations used by the CLI.
type FileSystem interface {
	ReadFile(path string) ([]byte, error)
	WriteFile(path string, data []byte, perm os.FileMode) error
	Stat(path string) (os.FileInfo, error)
	MkdirAll(path string, perm os.FileMode) error
	Remove(path string) error
}

// Environment defines access to environment variables.
type Environment interface {
	Get(key string) string
	Set(key string, value string) error
	Lookup(key string) (string, bool)
}

// GitClient defines git operations needed by the CLI.
type GitClient interface {
	GetHead(dir string) (string, string, error)
	ListRemotes(dir string) (map[string]RemoteInfo, error)
}
