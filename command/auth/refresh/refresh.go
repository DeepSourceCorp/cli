package refresh

import (
	"context"
	"fmt"
	"time"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/spf13/cobra"
)

type RefreshOptions struct {
	Token        string
	RefreshToken string
}

// NewCmdRefresh handles the refreshing of authentication credentials
func NewCmdRefresh() *cobra.Command {
	opts := RefreshOptions{
		Token:        config.Cfg.Token,
		RefreshToken: config.Cfg.RefreshToken,
	}

	cmd := &cobra.Command{
		Use:   "refresh",
		Short: "Refresh stored authentication credentials",
		Args:  utils.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			err := opts.Run()
			if err != nil {
				return err
			}
			return nil
		},
	}
	return cmd
}

func (opts *RefreshOptions) Run() error {
	// Check if token as well as refresh token are present since they
	// are required for refreshing auth
	if opts.Token != "" || opts.RefreshToken != "" {
		// Fetching DS Client
		deepsource := deepsource.New()
		ctx := context.Background()
		// Use the SDK to fetch the new auth data
		refreshedConfigData, err := deepsource.RefreshAuthCreds(ctx, opts.RefreshToken)
		if err != nil {
			return err
		}

		// Convert incoming config into the local CLI config format
		finalConfig := config.CLIConfig{
			User:                  refreshedConfigData.Refreshtoken.Payload.Email,
			Token:                 refreshedConfigData.Refreshtoken.Token,
			RefreshToken:          refreshedConfigData.Refreshtoken.Refreshtoken,
			RefreshTokenExpiresIn: time.Unix(refreshedConfigData.Refreshtoken.Refreshexpiresin, 0),
		}
		finalConfig.SetTokenExpiry(refreshedConfigData.Refreshtoken.Payload.Exp)

		// Having formatted the data, write it to the config file
		err = finalConfig.WriteFile()
		if err != nil {
			fmt.Println("Error in writing authentication data to a file. Exiting...")
			return err
		}
	} else {
		// In case, there is no token as well as refresh token, ask the user to login instead
		// TODO: Add ability to automatically run `login` command here
		return fmt.Errorf("User not authenticated. Please login using the command - `deepsource auth login`")
	}
	return nil
}
