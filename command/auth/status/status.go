package status

import (
	"context"
	stderrors "errors"
	"fmt"
	"io"
	"os"

	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/command/cmddeps"
	"github.com/deepsourcelabs/cli/command/cmdutil"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	dsuser "github.com/deepsourcelabs/cli/deepsource/user"
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
			return opts.Run(cmd)
		},
	}
	return cmd
}

func (opts *AuthStatusOptions) Run(cmd *cobra.Command) error {
	cfgMgr := opts.configManager()
	cfg, err := cfgMgr.Load()
	if err != nil {
		return clierrors.NewCLIError(clierrors.ErrInvalidConfig, "Error reading DeepSource CLI config", err)
	}
	if cfg.Token == "" {
		return clierrors.ErrNotLoggedIn()
	}

	if !cfg.TokenFromEnv && cfg.IsExpired() {
		style.Warnf(opts.stdout(), "Authentication expired. Run %q to re-authenticate", "deepsource auth login")
		return nil
	}

	client, err := opts.apiClient(cmd, cfg, cfgMgr)
	if err != nil {
		style.Warnf(opts.stdout(), "Could not connect to DeepSource to verify authentication")
		return nil
	}

	viewer, err := opts.verifyWithServer(client)
	if err != nil {
		return nil
	}

	displayUser := viewer.Email
	if displayUser == "" {
		displayUser = cfg.User
	}
	cfgMgr.BackfillUser(cfg, viewer.Email)

	msg := fmt.Sprintf("Logged in to DeepSource as %s", displayUser)
	if cfg.TokenFromEnv {
		msg += " (via DEEPSOURCE_TOKEN)"
	}
	fmt.Fprintln(opts.stdout(), msg+".")
	return nil
}

func (opts *AuthStatusOptions) configManager() *config.Manager {
	if opts.deps != nil && opts.deps.ConfigMgr != nil {
		return opts.deps.ConfigMgr
	}
	return config.DefaultManager()
}

func (opts *AuthStatusOptions) apiClient(cmd *cobra.Command, cfg *config.CLIConfig, cfgMgr *config.Manager) (*deepsource.Client, error) {
	if opts.deps != nil && opts.deps.Client != nil {
		return opts.deps.Client, nil
	}
	return deepsource.New(deepsource.ClientOpts{
		Token:              cfg.Token,
		HostName:           cfg.Host,
		InsecureSkipVerify: cmdutil.ResolveSkipTLSVerify(cmd, cfg.SkipTLSVerify),
		OnTokenRefreshed:   cfgMgr.TokenRefreshCallback(),
	})
}

func (opts *AuthStatusOptions) verifyWithServer(client *deepsource.Client) (*dsuser.User, error) {
	viewer, err := client.GetViewer(context.Background())
	if err != nil {
		var ce *clierrors.CLIError
		if stderrors.As(err, &ce) && ce.Code.IsAuthError() {
			style.Warnf(opts.stdout(), "Authentication expired. Run %q to re-authenticate", "deepsource auth login")
		} else {
			style.Warnf(opts.stdout(), "Could not connect to DeepSource to verify authentication")
		}
		return nil, err
	}
	return viewer, nil
}
