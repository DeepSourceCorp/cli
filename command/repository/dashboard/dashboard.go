package dashboard

import (
	"context"
	"fmt"
	"io"
	"os"

	"github.com/MakeNowJust/heredoc"
	"github.com/cli/browser"
	"github.com/deepsourcelabs/cli/command/cmddeps"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/internal/cli/args"
	"github.com/deepsourcelabs/cli/internal/cli/completion"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	reposvc "github.com/deepsourcelabs/cli/internal/services/repo"
	"github.com/spf13/cobra"
)

type DashboardOptions struct {
	RepoArg string
	deps    *cmddeps.Deps
}

func (opts *DashboardOptions) stdout() io.Writer {
	if opts.deps != nil && opts.deps.Stdout != nil {
		return opts.deps.Stdout
	}
	return os.Stdout
}

func NewCmdDashboard() *cobra.Command {
	return NewCmdDashboardWithDeps(nil)
}

func NewCmdDashboardWithDeps(deps *cmddeps.Deps) *cobra.Command {
	opts := DashboardOptions{
		deps: deps,
	}

	doc := heredoc.Docf(`
		Open the DeepSource dashboard for a repository.

		Run %[1]s to open the dashboard in your browser.

		To open the dashboard for a specific repository, use the %[2]s flag:
		%[3]s
		`, style.Cyan("deepsource repo dashboard"), style.Yellow("--repo"), style.Cyan("deepsource repo dashboard --repo gh/owner/name"))

	cmd := &cobra.Command{
		Use:   "dashboard",
		Short: "Open the DeepSource dashboard for the current repository",
		Long:  doc,
		Args:  args.NoArgs,
		RunE: func(_ *cobra.Command, _ []string) error {
			return opts.Run()
		},
	}

	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "Open the dashboard for a specific repository")
	_ = cmd.RegisterFlagCompletionFunc("repo", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return completion.RepoCompletionCandidates(), cobra.ShellCompDirectiveNoFileComp
	})

	return cmd
}

func (opts *DashboardOptions) Run() error {
	ctx := context.Background()

	var cfgMgr *config.Manager
	if opts.deps != nil && opts.deps.ConfigMgr != nil {
		cfgMgr = opts.deps.ConfigMgr
	} else {
		cfgMgr = config.DefaultManager()
	}

	var svc *reposvc.Service
	if opts.deps != nil && opts.deps.RepoService != nil {
		svc = opts.deps.RepoService
	} else {
		svc = reposvc.NewService(cfgMgr)
	}

	dashboardURL, err := svc.ViewURL(ctx, opts.RepoArg)
	if err != nil {
		return err
	}

	// In test mode, write URL to stdout instead of opening browser
	if opts.deps != nil && opts.deps.Stdout != nil {
		fmt.Fprintf(opts.stdout(), "%s\n", dashboardURL)
		return nil
	}

	fmt.Printf("Opening %s in your browser..\n", dashboardURL)
	return browser.OpenURL(dashboardURL)
}
