package refresh

import (
	"context"
	"fmt"
	"time"

	"github.com/deepsourcelabs/cli/cmdutils"
	cliConfig "github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/global"
	"github.com/spf13/cobra"
)

type RefreshOptions struct {
	Token        string
	RefreshToken string
}

// NewCmdVersion returns the current version of cli being used
func NewCmdRefresh() *cobra.Command {
	opts := RefreshOptions{
		Token:        global.Token,
		RefreshToken: global.RefreshToken,
	}

	cmd := &cobra.Command{
		Use:   "refresh",
		Short: "Refresh stored authentication credentials",
		Args:  cmdutils.NoArgs,
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

	if opts.Token != "" || opts.RefreshToken != "" {

		deepsource := deepsource.New()
		ctx := context.Background()
		refreshedConfigData, err := deepsource.RefreshAuthCreds(ctx, opts.RefreshToken)
		if err != nil {
			return err
		}

		// Convert incoming config into the ConfigData format
		finalConfig := cliConfig.CLIConfig{
			User:                  refreshedConfigData.Refreshtoken.Payload.Email,
			Token:                 refreshedConfigData.Refreshtoken.Token,
			RefreshToken:          refreshedConfigData.Refreshtoken.Refreshtoken,
			RefreshTokenExpiresIn: time.Unix(refreshedConfigData.Refreshtoken.Refreshexpiresin, 0),
		}

		finalConfig.SetTokenExpiry(refreshedConfigData.Refreshtoken.Payload.Exp)

		err = finalConfig.WriteFile()
		if err != nil {
			fmt.Println("Error in writing authentication data to a file. Exiting...")
			return err
		}
	} else {
		return fmt.Errorf("User not authenticated. Please login using the command - `deepsource auth login`")
	}
	return nil
}
