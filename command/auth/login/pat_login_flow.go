package login

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/config"
	authsvc "github.com/deepsourcelabs/cli/internal/services/auth"
	"github.com/fatih/color"
)

func (opts *LoginOptions) startPATLoginFlow(svc *authsvc.Service, cfg *config.CLIConfig, token string) error {
	cfg.Token = token

	viewer, err := svc.GetViewer(context.Background(), cfg)
	if err != nil {
		return fmt.Errorf("Invalid token: could not authenticate with DeepSource")
	}
	cfg.User = viewer.Email

	err = svc.SaveConfig(cfg)
	if err != nil {
		return fmt.Errorf("Error in writing authentication data to a file. Exiting..")
	}

	c := color.New(color.FgGreen, color.Bold)
	c.Printf("Logged in as %s\n", viewer.Email)
	return nil
}
