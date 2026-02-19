package reportcard

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"

	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/command/cmddeps"
	"github.com/deepsourcelabs/cli/command/cmdutil"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/runs"
	"github.com/deepsourcelabs/cli/internal/cli/completion"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
	"github.com/deepsourcelabs/cli/internal/vcs"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
	"gopkg.in/yaml.v3"
)

type ReportCardOptions struct {
	RepoArg       string
	CommitOid     string
	PRNumber      int
	DefaultBranch bool
	OutputFormat  string
	OutputFile    string
	deps          *cmddeps.Deps
	reportCard    *runs.ReportCard
	commitOid     string
	branchName    string
}

func (opts *ReportCardOptions) stdout() io.Writer {
	if opts.deps != nil && opts.deps.Stdout != nil {
		return opts.deps.Stdout
	}
	return os.Stdout
}

func NewCmdReportCard() *cobra.Command {
	return NewCmdReportCardWithDeps(nil)
}

func NewCmdReportCardWithDeps(deps *cmddeps.Deps) *cobra.Command {
	opts := ReportCardOptions{
		OutputFormat: "pretty",
		deps:         deps,
	}

	doc := heredoc.Docf(`
		View the report card for a repository.

		By default, shows the report card from the latest analyzed commit on the current branch.
		Use %[1]s, %[2]s, or %[3]s to scope to a specific analysis run or pull request.

		Examples:
		  %[4]s
		  %[5]s
		  %[6]s
		  %[7]s
		  %[8]s
		`,
		style.Yellow("--commit"),
		style.Yellow("--pr"),
		style.Yellow("--default-branch"),
		style.Cyan("deepsource report-card"),
		style.Cyan("deepsource report-card --repo owner/repo"),
		style.Cyan("deepsource report-card --commit abc123f"),
		style.Cyan("deepsource report-card --pr 123"),
		style.Cyan("deepsource report-card --default-branch"),
	)

	cmd := &cobra.Command{
		Use:   "report-card [flags]",
		Short: "View repository report card",
		Long:  doc,
		RunE: func(cmd *cobra.Command, _ []string) error {
			return opts.Run(cmd.Context())
		},
	}

	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "Repository (owner/name)")
	cmd.Flags().StringVar(&opts.CommitOid, "commit", "", "Scope to a specific analysis run by commit SHA")
	cmd.Flags().IntVar(&opts.PRNumber, "pr", 0, "Scope to a specific pull request by number")
	cmd.Flags().BoolVar(&opts.DefaultBranch, "default-branch", false, "Show report card from the default branch instead of current branch")
	cmd.Flags().StringVarP(&opts.OutputFormat, "output", "o", "pretty", "Output format: pretty, json, yaml")
	cmd.Flags().StringVar(&opts.OutputFile, "output-file", "", "Write output to a file instead of stdout")

	_ = cmd.RegisterFlagCompletionFunc("repo", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return completion.RepoCompletionCandidates(), cobra.ShellCompDirectiveNoFileComp
	})
	_ = cmd.RegisterFlagCompletionFunc("output", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return []string{
			"pretty\tPretty-printed output",
			"json\tJSON output",
			"yaml\tYAML output",
		}, cobra.ShellCompDirectiveNoFileComp
	})

	cmd.MarkFlagsMutuallyExclusive("commit", "pr", "default-branch")

	return cmd
}

func (opts *ReportCardOptions) Run(ctx context.Context) error {
	var cfgMgr *config.Manager
	if opts.deps != nil && opts.deps.ConfigMgr != nil {
		cfgMgr = opts.deps.ConfigMgr
	} else {
		cfgMgr = config.DefaultManager()
	}
	cfg, err := cfgMgr.Load()
	if err != nil {
		return clierrors.NewCLIError(clierrors.ErrInvalidConfig, "Error reading DeepSource CLI config", err)
	}
	if err := cfg.VerifyAuthentication(); err != nil {
		return err
	}

	remote, err := vcs.ResolveRemote(opts.RepoArg)
	if err != nil {
		return err
	}

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
			return err
		}
	}

	if opts.CommitOid != "" {
		opts.CommitOid = cmdutil.ResolveCommitOid(opts.CommitOid)
	}

	switch {
	case opts.CommitOid != "":
		err = opts.resolveByCommit(ctx, client, remote)
	case opts.PRNumber > 0:
		err = opts.resolveByPR(ctx, client, remote)
	case opts.DefaultBranch:
		err = opts.resolveByDefaultBranch(ctx, client, remote)
	default:
		err = opts.resolveByCurrentBranch(ctx, client, remote)
	}
	if err != nil {
		return err
	}

	if opts.reportCard == nil {
		pterm.Info.Println("No report card available for this analysis run.")
		return nil
	}

	switch opts.OutputFormat {
	case "json":
		return opts.outputJSON()
	case "yaml":
		return opts.outputYAML()
	default:
		return opts.outputHuman()
	}
}

func (opts *ReportCardOptions) resolveByCommit(ctx context.Context, client *deepsource.Client, remote *vcs.RemoteData) error {
	run, err := client.GetRunByCommit(ctx, opts.CommitOid)
	if err != nil {
		return fmt.Errorf("failed to fetch analysis run: %w", err)
	}
	if run == nil {
		return fmt.Errorf("no analysis run found for commit %s", opts.CommitOid)
	}

	opts.reportCard = run.ReportCard
	opts.commitOid = run.CommitOid
	opts.branchName = run.BranchName
	return nil
}

func (opts *ReportCardOptions) resolveByPR(ctx context.Context, client *deepsource.Client, remote *vcs.RemoteData) error {
	branch, err := client.GetPRBranch(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, opts.PRNumber)
	if err != nil {
		return err
	}

	var commitLogFunc func(string) ([]string, error)
	if opts.deps != nil {
		commitLogFunc = opts.deps.CommitLogFunc
	}

	run, err := cmdutil.ResolveLatestRunForBranch(ctx, client, remote, branch, commitLogFunc)
	if err != nil {
		return fmt.Errorf("no successful analysis run found for PR #%d (branch %q): %w", opts.PRNumber, branch, err)
	}

	opts.reportCard = run.ReportCard
	opts.commitOid = run.CommitOid
	opts.branchName = run.BranchName
	return nil
}

func (opts *ReportCardOptions) resolveByDefaultBranch(ctx context.Context, client *deepsource.Client, remote *vcs.RemoteData) error {
	defaultBranch := cmdutil.GetDefaultBranch()
	if defaultBranch == "" {
		return fmt.Errorf("could not detect default branch; try --commit instead")
	}

	var commitLogFunc func(string) ([]string, error)
	if opts.deps != nil {
		commitLogFunc = opts.deps.CommitLogFunc
	}

	run, err := cmdutil.ResolveLatestRunForBranch(ctx, client, remote, defaultBranch, commitLogFunc)
	if err != nil {
		return err
	}

	opts.reportCard = run.ReportCard
	opts.commitOid = run.CommitOid
	opts.branchName = run.BranchName
	return nil
}

func (opts *ReportCardOptions) resolveByCurrentBranch(ctx context.Context, client *deepsource.Client, remote *vcs.RemoteData) error {
	var branchNameFunc func() (string, error)
	var commitLogFunc func(string) ([]string, error)
	if opts.deps != nil {
		branchNameFunc = opts.deps.BranchNameFunc
		commitLogFunc = opts.deps.CommitLogFunc
	}

	branchName, err := cmdutil.ResolveBranchName(branchNameFunc)
	if err != nil {
		return err
	}

	run, err := cmdutil.ResolveLatestRunForBranch(ctx, client, remote, branchName, commitLogFunc)
	if err != nil {
		return err
	}

	opts.reportCard = run.ReportCard
	opts.commitOid = run.CommitOid
	opts.branchName = run.BranchName
	return nil
}

func (opts *ReportCardOptions) outputHuman() error {
	commitShort := opts.commitOid
	if len(commitShort) > 8 {
		commitShort = commitShort[:8]
	}

	pterm.DefaultBox.WithTitle("Report Card").WithTitleTopCenter().Println(
		fmt.Sprintf("%s %s\n%s %s",
			pterm.Bold.Sprint("Commit:"),
			commitShort,
			pterm.Bold.Sprint("Branch:"),
			opts.branchName,
		),
	)

	cmdutil.ShowReportCard(opts.reportCard)
	return nil
}

func (opts *ReportCardOptions) outputJSON() error {
	result := cmdutil.ToReportCardJSON(opts.reportCard)
	data, err := json.MarshalIndent(result, "", "  ")
	if err != nil {
		return clierrors.NewCLIError(clierrors.ErrAPIError, "Failed to format JSON output", err)
	}
	return opts.writeOutput(data, true)
}

func (opts *ReportCardOptions) outputYAML() error {
	result := cmdutil.ToReportCardJSON(opts.reportCard)
	data, err := yaml.Marshal(result)
	if err != nil {
		return clierrors.NewCLIError(clierrors.ErrAPIError, "Failed to format YAML output", err)
	}
	return opts.writeOutput(data, false)
}

func (opts *ReportCardOptions) writeOutput(data []byte, trailingNewline bool) error {
	if opts.OutputFile == "" {
		w := opts.stdout()
		if trailingNewline {
			fmt.Fprintln(w, string(data))
		} else {
			fmt.Fprint(w, string(data))
		}
		return nil
	}

	if err := os.WriteFile(opts.OutputFile, data, 0644); err != nil {
		return clierrors.NewCLIError(clierrors.ErrAPIError, "Failed to write output file", err)
	}
	pterm.Printf("Saved report card to %s!\n", opts.OutputFile)
	return nil
}
