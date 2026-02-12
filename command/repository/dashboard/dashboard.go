package dashboard

import (
	"context"
	"fmt"

	"github.com/MakeNowJust/heredoc"
	"github.com/cli/browser"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/internal/cli/args"
	"github.com/deepsourcelabs/cli/internal/cli/completion"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	reposvc "github.com/deepsourcelabs/cli/internal/services/repo"
	"github.com/spf13/cobra"
)

type DashboardOptions struct {
	RepoArg string
}

func NewCmdDashboard() *cobra.Command {
	opts := DashboardOptions{}

	doc := heredoc.Docf(`
		Open the DeepSource dashboard for a repository.

		Run %[1]s to open the dashboard in your browser.

		To open the dashboard for a specific repository, use the %[2]s flag:
		%[3]s
		`, style.Cyan("deepsource repository dashboard"), style.Yellow("--repo"), style.Cyan("deepsource repository dashboard --repo owner/repo"))

	cmd := &cobra.Command{
		Use:   "dashboard",
		Short: "Open the DeepSource dashboard for the current repository",
		Long:  doc,
		Args:  args.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			return opts.Run()
		},
	}

	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "Open the dashboard for a specific repository")
	_ = cmd.RegisterFlagCompletionFunc("repo", func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
		return completion.RepoCompletionCandidates(), cobra.ShellCompDirectiveNoFileComp
	})

	return cmd
}

func (opts *DashboardOptions) Run() error {
	ctx := context.Background()
	svc := reposvc.NewService(config.DefaultManager())
	dashboardURL, err := svc.ViewURL(ctx, opts.RepoArg)
	if err != nil {
		return err
	}

	fmt.Printf("Opening %s in your browser...\n", dashboardURL)
	return browser.OpenURL(dashboardURL)
}
