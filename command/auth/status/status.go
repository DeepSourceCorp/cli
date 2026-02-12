package status

import (
	"errors"

	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/internal/cli/args"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
	authsvc "github.com/deepsourcelabs/cli/internal/services/auth"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

type AuthStatusOptions struct{}

// NewCmdStatus handles the fetching of authentication status of CLI
func NewCmdStatus() *cobra.Command {
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
			opts := AuthStatusOptions{}
			return opts.Run()
		},
	}
	return cmd
}

func (opts *AuthStatusOptions) Run() error {
	svc := authsvc.NewService(config.DefaultManager())
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
		pterm.Printf("Logged in to DeepSource as %s.\n", cfg.User)
	} else {
		pterm.Println("The authentication has expired. Run \"deepsource auth login\" to re-authenticate.")
	}
	return nil
}
