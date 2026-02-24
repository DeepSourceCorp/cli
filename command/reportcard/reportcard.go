package reportcard

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"

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
	"github.com/spf13/pflag"
)

type ReportCardOptions struct {
	RepoArg       string
	CommitOid     string
	PRNumber      int
	DefaultBranch bool
	OutputFormat  string
	deps          *cmddeps.Deps
	reportCard    *runs.ReportCard
	repoSlug      string
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
		style.Cyan("deepsource report-card --repo gh/owner/name"),
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

	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "Repository in provider/owner/name format (e.g. gh/owner/name). Supported providers: gh, gl, bb, ads")
	cmd.Flags().StringVarP(&opts.OutputFormat, "output", "o", "pretty", "Output format: pretty, json")
	cmd.Flags().StringVar(&opts.CommitOid, "commit", "", "Scope to a specific analysis run by commit SHA")
	cmd.Flags().IntVar(&opts.PRNumber, "pr", 0, "Scope to a specific pull request by number")
	cmd.Flags().BoolVar(&opts.DefaultBranch, "default-branch", false, "Show report card from the default branch instead of current branch")

	_ = cmd.RegisterFlagCompletionFunc("repo", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return completion.RepoCompletionCandidates(), cobra.ShellCompDirectiveNoFileComp
	})
	_ = cmd.RegisterFlagCompletionFunc("output", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return []string{
			"pretty\tPretty-printed output",
			"json\tJSON output",
		}, cobra.ShellCompDirectiveNoFileComp
	})

	cmd.MarkFlagsMutuallyExclusive("commit", "pr", "default-branch")

	setReportCardUsageFunc(cmd)

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
	opts.repoSlug = remote.Owner + "/" + remote.RepoName

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
		err = opts.resolveByCommit(ctx, client)
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
		style.Infof(opts.stdout(), "No report card found in %s on %s.", opts.repoSlug, opts.scopeLabel())
		return nil
	}

	switch opts.OutputFormat {
	case "json":
		return opts.outputJSON()
	default:
		return opts.outputHuman()
	}
}

func (opts *ReportCardOptions) resolveByCommit(ctx context.Context, client *deepsource.Client) error {
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

	run, err := cmdutil.ResolveLatestRunForBranch(ctx, client, branch, remote)
	if err != nil {
		return fmt.Errorf("no analysis run found for PR #%d (branch %q): %w", opts.PRNumber, branch, err)
	}

	if cmdutil.IsRunInProgress(run.Status) {
		style.Infof(opts.stdout(), "Analysis is still in progress for PR #%d (branch %q).", opts.PRNumber, branch)
		return nil
	}
	if cmdutil.IsRunTimedOut(run.Status) {
		style.Warnf(opts.stdout(), "Analysis timed out for PR #%d (branch %q).", opts.PRNumber, branch)
		return nil
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

	run, err := cmdutil.ResolveLatestRunForBranch(ctx, client, defaultBranch, remote)
	if err != nil {
		return err
	}

	if cmdutil.IsRunInProgress(run.Status) {
		style.Infof(opts.stdout(), "Analysis is still in progress for branch %q.", defaultBranch)
		return nil
	}
	if cmdutil.IsRunTimedOut(run.Status) {
		style.Warnf(opts.stdout(), "Analysis timed out for branch %q.", defaultBranch)
		return nil
	}

	opts.reportCard = run.ReportCard
	opts.commitOid = run.CommitOid
	opts.branchName = run.BranchName
	return nil
}

func (opts *ReportCardOptions) resolveByCurrentBranch(ctx context.Context, client *deepsource.Client, remote *vcs.RemoteData) error {
	var branchNameFunc func() (string, error)
	if opts.deps != nil {
		branchNameFunc = opts.deps.BranchNameFunc
	}

	branchName, err := cmdutil.ResolveBranchName(branchNameFunc)
	if err != nil {
		return err
	}

	// Try to auto-detect an open PR for this branch
	if prNumber, found := cmdutil.ResolvePRForBranch(ctx, client, branchName, remote); found {
		opts.PRNumber = prNumber
		return opts.resolveByPR(ctx, client, remote)
	}

	run, err := cmdutil.ResolveLatestRunForBranch(ctx, client, branchName, remote)
	if err != nil {
		return err
	}

	if cmdutil.IsRunInProgress(run.Status) {
		style.Infof(opts.stdout(), "Analysis is still in progress for branch %q.", branchName)
		return nil
	}
	if cmdutil.IsRunTimedOut(run.Status) {
		style.Warnf(opts.stdout(), "Analysis timed out for branch %q.", branchName)
		return nil
	}

	opts.reportCard = run.ReportCard
	opts.commitOid = run.CommitOid
	opts.branchName = run.BranchName
	return nil
}

func (opts *ReportCardOptions) scopeLabel() string {
	switch {
	case opts.branchName != "" && opts.commitOid != "":
		commitShort := opts.commitOid
		if len(commitShort) > 8 {
			commitShort = commitShort[:8]
		}
		return fmt.Sprintf("%s (%s)", opts.branchName, commitShort)
	case opts.CommitOid != "":
		commitShort := opts.CommitOid
		if len(commitShort) > 8 {
			commitShort = commitShort[:8]
		}
		return fmt.Sprintf("commit %s", commitShort)
	case opts.PRNumber > 0:
		return fmt.Sprintf("PR #%d", opts.PRNumber)
	default:
		return "default branch"
	}
}

func (opts *ReportCardOptions) outputHuman() error {
	commitShort := opts.commitOid
	if len(commitShort) > 8 {
		commitShort = commitShort[:8]
	}

	fmt.Println(pterm.Bold.Sprintf("── Report Card · %s (%s) ────", opts.branchName, commitShort))

	cmdutil.ShowReportCard(opts.stdout(), opts.reportCard)
	return nil
}

func (opts *ReportCardOptions) outputJSON() error {
	result := cmdutil.ToReportCardJSON(opts.reportCard)
	data, err := json.MarshalIndent(result, "", "  ")
	if err != nil {
		return clierrors.NewCLIError(clierrors.ErrAPIError, "Failed to format JSON output", err)
	}
	fmt.Fprintln(opts.stdout(), string(data))
	return nil
}

func setReportCardUsageFunc(cmd *cobra.Command) {
	cmd.SetUsageFunc(func(c *cobra.Command) error {
		groups := []struct {
			title string
			flags []string
		}{
			{"Scope", []string{"commit", "pr", "default-branch"}},
			{"Output", []string{"output"}},
			{"General", []string{"repo", "help"}},
		}

		w := c.OutOrStderr()
		fmt.Fprintf(w, "Usage:\n  %s\n", c.UseLine())
		for _, g := range groups {
			fmt.Fprintf(w, "\n%s:\n", g.title)
			for _, name := range g.flags {
				f := c.Flags().Lookup(name)
				if f == nil {
					continue
				}
				fmt.Fprintf(w, "  %s\n", reportCardFlagUsageLine(f))
			}
		}
		fmt.Fprintln(w)
		return nil
	})
}

func reportCardFlagUsageLine(f *pflag.Flag) string {
	var line string
	if f.Shorthand != "" {
		line = fmt.Sprintf("-%s, --%s", f.Shorthand, f.Name)
	} else {
		line = fmt.Sprintf("    --%s", f.Name)
	}

	vartype := f.Value.Type()
	switch vartype {
	case "bool":
		// no type suffix for booleans
	default:
		line += " " + vartype
	}

	const pad = 28
	if len(line) < pad {
		line += strings.Repeat(" ", pad-len(line))
	} else {
		line += "  "
	}
	line += f.Usage

	if f.DefValue != "" && f.DefValue != "false" && f.DefValue != "[]" && f.DefValue != "0" {
		line += fmt.Sprintf(" (default %s)", f.DefValue)
	}
	return line
}
