package login

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/config"
	authsvc "github.com/deepsourcelabs/cli/internal/services/auth"
	"github.com/fatih/color"
)

// Starts the login flow for the CLI (using PAT)
func (opts *LoginOptions) startPATLoginFlow(svc *authsvc.Service, cfg *config.CLIConfig, token string) error {
	// set personal access token (PAT)
	cfg.Token = token

	// Verify the token against the server before saving
	viewer, err := svc.GetViewer(context.Background(), cfg)
	if err != nil {
		return fmt.Errorf("Invalid token: could not authenticate with DeepSource")
	}
	cfg.User = viewer.Email

	// Having stored the data in the global Cfg object, write it into the config file present in the local filesystem
	err = svc.SaveConfig(cfg)
	if err != nil {
		return fmt.Errorf("Error in writing authentication data to a file. Exiting..")
	}

	c := color.New(color.FgGreen, color.Bold)
	c.Printf("Logged in as %s\n", viewer.Email)
	return nil
}
