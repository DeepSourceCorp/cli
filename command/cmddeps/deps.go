package cmddeps

import (
	"io"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	reposvc "github.com/deepsourcelabs/cli/internal/services/repo"
	"github.com/deepsourcelabs/cli/internal/vcs"
)

// Deps holds injectable dependencies for commands, enabling testability.
// When nil or when individual fields are nil, commands fall back to
// production defaults.
type Deps struct {
	Client      *deepsource.Client
	ConfigMgr   *config.Manager
	Stdout      io.Writer
	Stderr      io.Writer
	RepoService *reposvc.Service
	BranchNameFunc func() (string, error)
	RemoteFunc     func() (*vcs.RemoteData, error)
}
