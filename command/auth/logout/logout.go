package logout

import (
	"errors"

	"github.com/deepsourcelabs/cli/command/cmddeps"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/internal/cli/args"
	"github.com/deepsourcelabs/cli/internal/cli/prompt"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
	authsvc "github.com/deepsourcelabs/cli/internal/services/auth"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

type LogoutOptions struct {
	deps *cmddeps.Deps
}

// NewCmdLogout handles the logout functionality for the CLI
func NewCmdLogout() *cobra.Command {
	return NewCmdLogoutWithDeps(nil)
}

// NewCmdLogoutWithDeps creates the logout command with injectable dependencies.
func NewCmdLogoutWithDeps(deps *cmddeps.Deps) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "logout",
		Short: "Logout of your active DeepSource account",
		Args:  args.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			opts := LogoutOptions{deps: deps}
			return opts.Run()
		},
	}
	return cmd
}

func (opts *LogoutOptions) Run() error {
	var cfgMgr *config.Manager
	if opts.deps != nil && opts.deps.ConfigMgr != nil {
		cfgMgr = opts.deps.ConfigMgr
	} else {
		cfgMgr = config.DefaultManager()
	}
	svc := authsvc.NewService(cfgMgr)
	// Fetch config
	cfg, err := svc.LoadConfig()
	if err != nil {
		return clierrors.NewCLIError(clierrors.ErrInvalidConfig, "Error reading DeepSource CLI config", err)
	}
	// Checking if the user has authenticated / logged in or not
	if cfg.Token == "" {
		return errors.New("You are not logged into DeepSource. Run \"deepsource auth login\" to authenticate.")
	}

	// Confirm from the user if they want to logout
	logoutConfirmationMsg := "Are you sure you want to log out of DeepSource account?"
	response, err := prompt.ConfirmFromUser(logoutConfirmationMsg, "")
	if err != nil {
		return err
	}

	// If response is true, delete the config file => logged out the user
	if response {
		if err := svc.DeleteConfig(); err != nil {
			return err
		}
	}
	pterm.Println("Logged out from DeepSource (deepsource.com)")
	return nil
}
