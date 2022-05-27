package refresh

import (
	"context"
	"errors"
	"fmt"

	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

type RefreshOptions struct{}

// NewCmdRefresh handles the refreshing of authentication credentials
func NewCmdRefresh() *cobra.Command {
	doc := heredoc.Docf(`
		Refresh stored authentication credentials.

		Authentication credentials expire after a certain amount of time.

		To renew the authentication credentials, use %[1]s
		`, utils.Yellow("deepsource auth refresh"))

	opts := RefreshOptions{}

	cmd := &cobra.Command{
		Use:   "refresh",
		Short: "Refresh stored authentication credentials",
		Long:  doc,
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

	// Fetching DS Client
	deepsource, err := deepsource.New(deepsource.ClientOpts{
		Token:    config.Cfg.Token,
		HostName: config.Cfg.Host,
	})
	if err != nil {
		return err
	}
	ctx := context.Background()
	// Use the SDK to fetch the new auth data
	refreshedConfigData, err := deepsource.RefreshAuthCreds(ctx, cfg.Token)
	if err != nil {
		return err
	}

	// Convert incoming config into the local CLI config format
	cfg.User = refreshedConfigData.User.Email
	cfg.Token = refreshedConfigData.Token
	cfg.SetTokenExpiry(refreshedConfigData.Expiry)

	// Having formatted the data, write it to the config file
	err = cfg.WriteFile()
	if err != nil {
		fmt.Println("Error in writing authentication data to a file. Exiting...")
		return err
	}
	pterm.Info.Println("Authentication successfully refreshed.")
	return nil
}
