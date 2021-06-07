package cmdutils

import (
	"github.com/deepsourcelabs/cli/api"
	cliConfig "github.com/deepsourcelabs/cli/internal/config"
)

type CLIFactory struct {
	Config       cliConfig.ConfigData
	GQLClient    *api.DSClient
	HostName     string
	TokenExpired bool
}
