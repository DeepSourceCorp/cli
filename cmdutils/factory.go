package cmdutils

import (
	"github.com/deepsourcelabs/cli/api"
	"github.com/deepsourcelabs/cli/internal/config"
)

type CLIFactory struct {
	Config       config.ConfigData
	GQLClient    *api.DSClient
	HostName     string
	TokenExpired bool
}
