package refresh

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

type RefreshOptions struct{}

// NewCmdRefresh handles the refreshing of authentication credentials
func NewCmdRefresh() *cobra.Command {
	opts := RefreshOptions{}

	cmd := &cobra.Command{
		Use:   "refresh",
		Short: "Refresh stored authentication credentials",
		Args:  utils.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			return opts.Run()
		},
	}
	return cmd
}

func (opts *RefreshOptions) Run() error {
	// Fetch config
	cfg, err := config.GetConfig()
	if err != nil {
		return fmt.Errorf("Error while reading DeepSource CLI config : %v", err)
	}
	// Checking if the user has authenticated / logged in or not
	if cfg.Token == "" {
		return errors.New("You are not logged into DeepSource. Run \"deepsource auth login\" to authenticate.")
	}

	// Check if token as well as refresh token are present since they
	// are required for refreshing auth
	if cfg.Token == "" || cfg.RefreshToken == "" {
		// In case, there is no token as well as refresh token, ask the user to login instead
		// TODO: Add ability to automatically run `login` command here
		return fmt.Errorf("You are not logged into DeepSource. Run \"deepsource auth login\" to authenticate.")
	}

	// Fetching DS Client
	deepsource, err := deepsource.New(deepsource.ClientProperties{
		Token:    config.Cfg.Token,
		HostName: config.Cfg.Host,
	})
	if err != nil {
		return err
	}
	ctx := context.Background()
	// Use the SDK to fetch the new auth data
	refreshedConfigData, err := deepsource.RefreshAuthCreds(ctx, cfg.RefreshToken)
	if err != nil {
		return err
	}

	// Convert incoming config into the local CLI config format
	cfg.User = refreshedConfigData.Payload.Email
	cfg.Token = refreshedConfigData.Token
	cfg.RefreshToken = refreshedConfigData.Refreshtoken
	cfg.RefreshTokenExpiresIn = time.Unix(refreshedConfigData.RefreshExpiresIn, 0)
	cfg.SetTokenExpiry(refreshedConfigData.Payload.Exp)

	// Having formatted the data, write it to the config file
	err = cfg.WriteFile()
	if err != nil {
		fmt.Println("Error in writing authentication data to a file. Exiting...")
		return err
	}
	pterm.Info.Println("Authentication successfully refreshed.")
	return nil
}
