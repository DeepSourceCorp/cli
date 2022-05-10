package login

import (
	"fmt"

	"github.com/deepsourcelabs/cli/config"
)

// Starts the login flow for the CLI (using PAT)
func (*LoginOptions) startPATLoginFlow(cfg *config.CLIConfig, token string) error {
	// set personal access token (PAT)
	cfg.Token = token

	// Having stored the data in the global Cfg object, write it into the config file present in the local filesystem
	err := cfg.WriteFile()
	if err != nil {
		return fmt.Errorf("Error in writing authentication data to a file. Exiting...")
	}
	return nil
}
