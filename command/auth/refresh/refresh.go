package refresh

import (
	"context"
	"fmt"
	"time"

	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/global"
	cliConfig "github.com/deepsourcelabs/cli/internal/config"
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
		RunE: func(cmd *cobra.Command, args []string) error {
			err := opts.Run()
			if err != nil {
				return err
			}
			return nil
		},
		SilenceErrors: true,
		SilenceUsage:  true,
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
		finalConfig := cliConfig.ConfigData{
			User:                refreshedConfigData.Refreshtoken.Payload.Email,
			Token:               refreshedConfigData.Refreshtoken.Token,
			TokenExpiry:         refreshedConfigData.Refreshtoken.Payload.Exp,
			RefreshToken:        refreshedConfigData.Refreshtoken.Refreshtoken,
			OrigIAT:             refreshedConfigData.Refreshtoken.Payload.Origiat,
			RefreshTokenExpiry:  refreshedConfigData.Refreshtoken.Refreshexpiresin,
			RefreshTokenSetTime: time.Now().Unix(),
		}

		err = cliConfig.WriteConfigToFile(finalConfig)
		if err != nil {
			fmt.Println("Error in writing authentication data to a file. Exiting...")
			return err
		}
	} else {
		return fmt.Errorf("User not authenticated. Please login using the command - `deepsource auth login`")
	}
	return nil
}
