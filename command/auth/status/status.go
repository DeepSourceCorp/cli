package status

import (
	"context"
	stderrors "errors"
	"fmt"
	"io"
	"os"

	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/command/cmddeps"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/internal/cli/args"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
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
	// Fetch config
	cfg, err := cfgMgr.Load()
	if err != nil {
		return clierrors.NewCLIError(clierrors.ErrInvalidConfig, "Error reading DeepSource CLI config", err)
	}
	// Checking if the user has authenticated / logged in or not
	if cfg.Token == "" {
		return clierrors.ErrNotLoggedIn()
	}

	// Fast path: if the local token expiry has passed, no need for a network call
	if cfg.IsExpired() {
		style.Warnf(opts.stdout(), "Authentication expired. Run %q to re-authenticate", "deepsource auth login")
		return nil
	}

	// Validate token against the server
	var client *deepsource.Client
	if opts.deps != nil && opts.deps.Client != nil {
		client = opts.deps.Client
	} else {
		client, err = deepsource.New(deepsource.ClientOpts{
			Token:            cfg.Token,
			HostName:         cfg.Host,
			OnTokenRefreshed: cfgMgr.TokenRefreshCallback(),
		})
		if err != nil {
			fmt.Fprintf(opts.stdout(), "Logged in to DeepSource as %s (could not verify with server).\n", cfg.User)
			return nil
		}
	}

	_, verifyErr := client.GetViewer(context.Background())
	if verifyErr != nil {
		var ce *clierrors.CLIError
		if stderrors.As(verifyErr, &ce) && ce.Code.IsAuthError() {
			style.Warnf(opts.stdout(), "Authentication expired. Run %q to re-authenticate", "deepsource auth login")
			return nil
		}
		// Network error or other non-auth failure — report as logged in but unverified
		fmt.Fprintf(opts.stdout(), "Logged in to DeepSource as %s (could not verify with server).\n", cfg.User)
		return nil
	}

	fmt.Fprintf(opts.stdout(), "Logged in to DeepSource as %s.\n", cfg.User)
	return nil
}
