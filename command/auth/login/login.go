package login

import (
	"context"
	"fmt"

	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/command/cmddeps"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/internal/cli/args"
	"github.com/deepsourcelabs/cli/internal/cli/prompt"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	authsvc "github.com/deepsourcelabs/cli/internal/services/auth"
	"github.com/spf13/cobra"
)

var accountTypes = []string{"DeepSource (deepsource.com)", "Enterprise Server"}

type LoginOptions struct {
	AuthTimedOut bool
	TokenExpired bool
	User         string
	HostName     string
	Interactive  bool
	PAT          string
	deps         *cmddeps.Deps
}

func NewCmdLogin() *cobra.Command {
	return NewCmdLoginWithDeps(nil)
}

func NewCmdLoginWithDeps(deps *cmddeps.Deps) *cobra.Command {
	doc := heredoc.Docf(`
		Log in to DeepSource using the CLI.

		The default authentication mode is a browser-based login flow.
		After completion, an authentication token will be stored internally.

		Use %[1]s to pass in a token on standard input, for example:
		%[2]s

		Use %[3]s to authenticate with a specific DeepSource instance, for example:
		%[4]s
		`, style.Yellow("--with-token"), style.Cyan("deepsource auth login --with-token dsp_abcd"), style.Yellow("--host"), style.Cyan("deepsource auth login --host my_instance"))

	opts := LoginOptions{
		AuthTimedOut: false,
		TokenExpired: true,
		User:         "",
		HostName:     "",
		deps:         deps,
	}

	cmd := &cobra.Command{
		Use:   "login",
		Short: "Log in to DeepSource using Command Line Interface",
		Long:  doc,
		Args:  args.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			return opts.Run()
		},
	}

	cmd.Flags().StringVar(&opts.HostName, "host", "", "Authenticate with a specific DeepSource instance")
	cmd.Flags().StringVar(&opts.HostName, "hostname", "", "Authenticate with a specific DeepSource instance")
	_ = cmd.Flags().MarkDeprecated("hostname", "use --host instead")
	cmd.Flags().BoolVarP(&opts.Interactive, "interactive", "i", false, "Interactive login prompt for authenticating with DeepSource")
	cmd.Flags().StringVar(&opts.PAT, "with-token", "", "Personal Access Token (PAT) for DeepSource")

	return cmd
}

func (opts *LoginOptions) Run() (err error) {
	var cfgMgr *config.Manager
	if opts.deps != nil && opts.deps.ConfigMgr != nil {
		cfgMgr = opts.deps.ConfigMgr
	} else {
		cfgMgr = config.DefaultManager()
	}
	var svc *authsvc.Service
	if opts.deps != nil && opts.deps.Client != nil {
		svc = authsvc.NewServiceWithFactory(cfgMgr, func(_ deepsource.ClientOpts) (*deepsource.Client, error) {
			return opts.deps.Client, nil
		})
	} else {
		svc = authsvc.NewService(cfgMgr)
	}
	cfg, err := svc.LoadConfig()
	if err != nil {
		cfg = config.NewDefault()
	}
	opts.User = cfg.User
	opts.TokenExpired = cfg.IsExpired()

	opts.verifyTokenWithServer(cfg, svc)

	if opts.Interactive {
		err = opts.handleInteractiveLogin()
		if err != nil {
			return err
		}
	}

	if opts.HostName != "" {
		cfg.Host = opts.HostName
	} else {
		cfg.Host = config.DefaultHostName
	}

	if opts.PAT != "" {
		return opts.startPATLoginFlow(svc, cfg, opts.PAT)
	}

	if !opts.TokenExpired && cfg.Token != "" {
		var msg string
		if opts.User != "" {
			msg = fmt.Sprintf("You're already logged into DeepSource as %s. Do you want to re-authenticate?", opts.User)
		} else {
			msg = "You're already logged into DeepSource. Do you want to re-authenticate?"
		}
		response, err := prompt.ConfirmFromUser(msg, "")
		if err != nil {
			return fmt.Errorf("Error in fetching response. Please try again.")
		}
		if !response {
			return nil
		}
	}

	return opts.startLoginFlow(svc, cfg)
}

func (opts *LoginOptions) verifyTokenWithServer(cfg *config.CLIConfig, svc *authsvc.Service) {
	if opts.TokenExpired || cfg.Token == "" {
		return
	}
	viewer, err := svc.GetViewer(context.Background(), cfg)
	if err != nil {
		opts.TokenExpired = true
		return
	}
	// Backfill user from the server when config file was missing or incomplete.
	if cfg.User == "" && viewer.Email != "" {
		cfg.User = viewer.Email
		opts.User = viewer.Email
		_ = svc.SaveConfig(cfg)
	}
}

func (opts *LoginOptions) handleInteractiveLogin() error {
	loginPromptMessage := "Which account do you want to login into?"
	loginPromptHelpText := "Select the type of account you want to authenticate"
	hostPromptMessage := "Please enter the hostname:"
	hostPromptHelpText := "The hostname of the DeepSource instance to authenticate with"

	loginType, err := prompt.SelectFromOptions(loginPromptMessage, loginPromptHelpText, accountTypes)
	if err != nil {
		return err
	}
	if loginType == "Enterprise Server" {
		opts.HostName, err = prompt.GetSingleLineInput(hostPromptMessage, hostPromptHelpText)
		if err != nil {
			return err
		}
	}

	return nil
}
