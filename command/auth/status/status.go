package status

import (
	"errors"
	"fmt"
	"io"
	"os"

	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/command/cmddeps"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/internal/cli/args"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
	authsvc "github.com/deepsourcelabs/cli/internal/services/auth"
	"github.com/spf13/cobra"
)

type AuthStatusOptions struct {
	deps *cmddeps.Deps
}

func (opts *AuthStatusOptions) stdout() io.Writer {
	if opts.deps != nil && opts.deps.Stdout != nil {
		return opts.deps.Stdout
	}
	return os.Stdout
}

// NewCmdStatus handles the fetching of authentication status of CLI
func NewCmdStatus() *cobra.Command {
	return NewCmdStatusWithDeps(nil)
}

func NewCmdStatusWithDeps(deps *cmddeps.Deps) *cobra.Command {
	doc := heredoc.Docf(`
		View the authentication status.

		To check the authentication status, use %[1]s
	`, style.Cyan("deepsource auth status"))

	cmd := &cobra.Command{
		Use:   "status",
		Short: "View the authentication status",
		Long:  doc,
		Args:  args.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			opts := AuthStatusOptions{deps: deps}
			return opts.Run()
		},
	}
	return cmd
}

func (opts *AuthStatusOptions) Run() error {
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

	// Check if the token has already expired
	if !cfg.IsExpired() {
		fmt.Fprintf(opts.stdout(), "Logged in to DeepSource as %s.\n", cfg.User)
	} else {
		fmt.Fprintln(opts.stdout(), "The authentication has expired. Run \"deepsource auth login\" to re-authenticate.")
	}
	return nil
}
