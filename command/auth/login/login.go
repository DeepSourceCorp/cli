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

// LoginOptions hold the metadata related to login operation
type LoginOptions struct {
	AuthTimedOut bool
	TokenExpired bool
	User         string
	HostName     string
	Interactive  bool
	PAT          string
	deps         *cmddeps.Deps
}

// NewCmdLogin handles the login functionality for the CLI
func NewCmdLogin() *cobra.Command {
	return NewCmdLoginWithDeps(nil)
}

// NewCmdLoginWithDeps creates the login command with injectable dependencies.
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

	// --host flag (--hostname kept as deprecated alias)
	cmd.Flags().StringVar(&opts.HostName, "host", "", "Authenticate with a specific DeepSource instance")
	cmd.Flags().StringVar(&opts.HostName, "hostname", "", "Authenticate with a specific DeepSource instance")
	_ = cmd.Flags().MarkDeprecated("hostname", "use --host instead")
	cmd.Flags().BoolVarP(&opts.Interactive, "interactive", "i", false, "Interactive login prompt for authenticating with DeepSource")
	cmd.Flags().StringVar(&opts.PAT, "with-token", "", "Personal Access Token (PAT) for DeepSource")

	return cmd
}

// Run executes the auth command and starts the login flow if not already authenticated
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
	// Fetch config (errors are non-fatal: a zero config just means "not logged in")
	cfg, err := svc.LoadConfig()
	if err != nil {
		cfg = &config.CLIConfig{}
	}
	opts.User = cfg.User
	opts.TokenExpired = cfg.IsExpired()

	// If local says valid, verify against the server
	opts.verifyTokenWithServer(cfg, cfgMgr)

	// Login using the interactive mode
	if opts.Interactive {
		err = opts.handleInteractiveLogin()
		if err != nil {
			return err
		}
	}

	// Checking if the user passed a hostname. If yes, storing it in the config
	// Else using the default hostname (deepsource.com)
	if opts.HostName != "" {
		cfg.Host = opts.HostName
	} else {
		cfg.Host = config.DefaultHostName
	}

	// Before starting the login workflow, check here for two conditions:
	// Condition 1 : If the token has expired, display a message about it and re-authenticate user
	// Condition 2 : If the token has not expired,does the user want to re-authenticate?

	// Checking for condition 1
	if !opts.TokenExpired {
		// The user is already logged in, confirm re-authentication.
		msg := fmt.Sprintf("You're already logged into DeepSource as %s. Do you want to re-authenticate?", opts.User)
		response, err := prompt.ConfirmFromUser(msg, "")
		if err != nil {
			return fmt.Errorf("Error in fetching response. Please try again.")
		}
		// If the response is No, it implies that the user doesn't want to re-authenticate
		// In this case, just exit
		if !response {
			return nil
		}
	}

	// If PAT is passed, start the login flow through PAT
	if opts.PAT != "" {
		return opts.startPATLoginFlow(svc, cfg, opts.PAT)
	}

	// Condition 2
	// `startLoginFlow` implements the authentication flow for the CLI
	return opts.startLoginFlow(svc, cfg)
}

func (opts *LoginOptions) verifyTokenWithServer(cfg *config.CLIConfig, cfgMgr *config.Manager) {
	if opts.TokenExpired || cfg.Token == "" || cfg.Host == "" {
		return
	}
	client, err := deepsource.New(deepsource.ClientOpts{
		Token:            cfg.Token,
		HostName:         cfg.Host,
		OnTokenRefreshed: cfgMgr.TokenRefreshCallback(),
	})
	if err != nil {
		return
	}
	if _, err := client.GetViewer(context.Background()); err != nil {
		opts.TokenExpired = true
	}
}

func (opts *LoginOptions) handleInteractiveLogin() error {
	// Prompt messages and help texts
	loginPromptMessage := "Which account do you want to login into?"
	loginPromptHelpText := "Select the type of account you want to authenticate"
	hostPromptMessage := "Please enter the hostname:"
	hostPromptHelpText := "The hostname of the DeepSource instance to authenticate with"

	// Display prompt to user
	loginType, err := prompt.SelectFromOptions(loginPromptMessage, loginPromptHelpText, accountTypes)
	if err != nil {
		return err
	}
	// Prompt the user for hostname only in the case of on-premise
	if loginType == "Enterprise Server" {
		opts.HostName, err = prompt.GetSingleLineInput(hostPromptMessage, hostPromptHelpText)
		if err != nil {
			return err
		}
	}

	return nil
}
