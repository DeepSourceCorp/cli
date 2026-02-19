package adapters

import "os"

// OSFileSystem uses the host filesystem.
type OSFileSystem struct{}

func NewOSFileSystem() *OSFileSystem {
	return &OSFileSystem{}
}

func (*OSFileSystem) ReadFile(path string) ([]byte, error) {
	return os.ReadFile(path)
}

func (*OSFileSystem) WriteFile(path string, data []byte, perm os.FileMode) error {
	return os.WriteFile(path, data, perm)
}

func (*OSFileSystem) Stat(path string) (os.FileInfo, error) {
	return os.Stat(path)
}

func (*OSFileSystem) MkdirAll(path string, perm os.FileMode) error {
	return os.MkdirAll(path, perm)
}

func (*OSFileSystem) Remove(path string) error {
	return os.Remove(path)
}
