package container

import (
	"time"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/internal/adapters"
	"github.com/deepsourcelabs/cli/internal/interfaces"
)

// Container holds application dependencies.
type Container struct {
	FileSystem  interfaces.FileSystem
	Environment interfaces.Environment
	GitClient   interfaces.GitClient
	HTTPClient  interfaces.HTTPClient
	Output      interfaces.OutputWriter
	Telemetry   interfaces.TelemetryClient
	Config      *config.Manager
}

// New creates a production dependency container.
func New() *Container {
	return &Container{
		FileSystem:  adapters.NewOSFileSystem(),
		Environment: adapters.NewRealEnvironment(),
		GitClient:   adapters.NewRealGitClient(),
		HTTPClient:  adapters.NewHTTPClient(60 * time.Second),
		Output:      adapters.NewDualOutputFromEnv(),
		Telemetry:   adapters.NewSentryClient(),
		Config:      config.DefaultManager(),
	}
}
