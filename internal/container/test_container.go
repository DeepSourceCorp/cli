package container

import (
	"os"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/internal/adapters"
	"github.com/deepsourcelabs/cli/internal/interfaces"
)

// NewTest creates a dependency container with test-friendly implementations.
func NewTest() *Container {
	return &Container{
		FileSystem:  adapters.NewOSFileSystem(),
		Environment: adapters.NewMockEnvironment(),
		GitClient:   adapters.NewMockGitClient(),
		HTTPClient:  adapters.NewMockHTTPClient(),
		Output:      adapters.NewBufferOutput(),
		Telemetry:   adapters.NewNoOpTelemetry(),
		Config:      config.NewManager(adapters.NewOSFileSystem(), os.UserHomeDir),
	}
}

// Compile-time interface checks.
var _ interfaces.FileSystem = (*adapters.OSFileSystem)(nil)
var _ interfaces.Environment = (*adapters.RealEnvironment)(nil)
var _ interfaces.GitClient = (*adapters.RealGitClient)(nil)
var _ interfaces.HTTPClient = (*adapters.MockHTTPClient)(nil)
var _ interfaces.OutputWriter = (*adapters.StdOutput)(nil)
var _ interfaces.TelemetryClient = (*adapters.SentryClient)(nil)
