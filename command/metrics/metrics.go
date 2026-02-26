package metrics

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"sort"
	"strings"

	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/command/cmddeps"
	"github.com/deepsourcelabs/cli/command/cmdutil"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/metrics"
	"github.com/deepsourcelabs/cli/internal/cli/completion"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
	"github.com/deepsourcelabs/cli/internal/vcs"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
)

type MetricsOptions struct {
	RepoArg          string
	CommitOid        string
	PRNumber         int
	DefaultBranch    bool
	OutputFormat     string
	Verbose          bool
	LimitArg         int
	repoSlug         string
	autoDetectedBranch string
	repoMetrics      []metrics.RepositoryMetric
	runMetrics       *metrics.RunMetrics
	prMetrics        *metrics.PRMetrics
	deps             *cmddeps.Deps
}

func (opts *MetricsOptions) stdout() io.Writer {
	if opts.deps != nil && opts.deps.Stdout != nil {
		return opts.deps.Stdout
	}
	return os.Stdout
}

func NewCmdMetrics() *cobra.Command {
	return NewCmdMetricsWithDeps(nil)
}

func NewCmdMetricsWithDeps(deps *cmddeps.Deps) *cobra.Command {
	opts := MetricsOptions{
		OutputFormat: "pretty",
		LimitArg:     30,
		deps:         deps,
	}

	doc := heredoc.Docf(`
		View code metrics for a repository.

		By default, shows metrics from the latest analyzed commit on the current branch. Use %[1]s or %[2]s
		to scope to a specific analysis run or pull request, or %[3]s to query
		the default branch.

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
		style.Cyan("deepsource metrics"),
		style.Cyan("deepsource metrics --repo gh/owner/name"),
		style.Cyan("deepsource metrics --commit abc123f"),
		style.Cyan("deepsource metrics --pr 123"),
		style.Cyan("deepsource metrics --default-branch"),
	)

	cmd := &cobra.Command{
		Use:   "metrics [flags]",
		Short: "View repository metrics",
		Long:  doc,
		RunE: func(cmd *cobra.Command, _ []string) error {
			return opts.Run(cmd.Context())
		},
	}

	// --repo, -r flag
	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "Repository in provider/owner/name format (e.g. gh/owner/name). Supported providers: gh, gl, bb, ads")

	// --limit, -l flag
	cmd.Flags().IntVarP(&opts.LimitArg, "limit", "l", 30, "Maximum number of metrics to fetch")

	// --output, -o flag
	cmd.Flags().StringVarP(&opts.OutputFormat, "output", "o", "pretty", "Output format: pretty, json")

	// --verbose, -v flag
	cmd.Flags().BoolVarP(&opts.Verbose, "verbose", "v", false, "Show shortcodes and descriptions")

	// Scoping flags
	cmd.Flags().StringVar(&opts.CommitOid, "commit", "", "Scope to a specific analysis run by commit SHA")
	cmd.Flags().IntVar(&opts.PRNumber, "pr", 0, "Scope to a specific pull request by number")
	cmd.Flags().BoolVar(&opts.DefaultBranch, "default-branch", false, "Show metrics from the default branch instead of current branch")

	// Completions
	_ = cmd.RegisterFlagCompletionFunc("repo", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return completion.RepoCompletionCandidates(), cobra.ShellCompDirectiveNoFileComp
	})
	_ = cmd.RegisterFlagCompletionFunc("output", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return []string{
			"pretty\tPretty-printed output",
			"json\tJSON output",
		}, cobra.ShellCompDirectiveNoFileComp
	})

	// Mutual exclusivity
	cmd.MarkFlagsMutuallyExclusive("commit", "pr", "default-branch")

	setMetricsUsageFunc(cmd)

	return cmd
}

func (opts *MetricsOptions) Run(ctx context.Context) error {
	// Load configuration
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

	// Resolve remote repository
	remote, err := vcs.ResolveRemote(opts.RepoArg)
	if err != nil {
		return err
	}
	opts.repoSlug = remote.Owner + "/" + remote.RepoName

	// Create DeepSource client
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

	if err := opts.resolveMetrics(ctx, client, remote); err != nil {
		return err
	}

	opts.applyLimit()

	// Output based on format
	var outErr error
	switch opts.OutputFormat {
	case "json":
		outErr = opts.outputJSON()
	default:
		outErr = opts.outputHuman()
	}
	if outErr != nil {
		return outErr
	}

	opts.warnIfLocalChanges()
	return nil
}

// warnIfLocalChanges prints a warning if the branch was auto-detected and
// has unpushed commits or uncommitted changes.
func (opts *MetricsOptions) warnIfLocalChanges() {
	if opts.autoDetectedBranch == "" || len(opts.getMetrics()) == 0 {
		return
	}

	hasUnpushed := cmdutil.HasUnpushedCommits
	if opts.deps != nil && opts.deps.HasUnpushedCommitsFunc != nil {
		hasUnpushed = opts.deps.HasUnpushedCommitsFunc
	}

	hasUncommitted := cmdutil.HasUncommittedChanges
	if opts.deps != nil && opts.deps.HasUncommittedChangesFunc != nil {
		hasUncommitted = opts.deps.HasUncommittedChangesFunc
	}

	unpushed := hasUnpushed()
	uncommitted := hasUncommitted()

	switch {
	case unpushed && uncommitted:
		style.Infof(opts.stdout(), "You have unpushed commits and uncommitted changes on branch %s. Displayed metrics may not reflect your latest local changes.", opts.autoDetectedBranch)
	case unpushed:
		style.Infof(opts.stdout(), "You have unpushed commits on branch %s. Displayed metrics may not reflect your latest local changes.", opts.autoDetectedBranch)
	case uncommitted:
		style.Infof(opts.stdout(), "You have uncommitted changes on branch %s. Displayed metrics may not reflect your latest local changes.", opts.autoDetectedBranch)
	}
}

func (opts *MetricsOptions) applyLimit() {
	if opts.LimitArg <= 0 {
		return
	}
	metricsList := opts.getMetrics()
	if len(metricsList) <= opts.LimitArg {
		return
	}
	truncated := metricsList[:opts.LimitArg]
	switch {
	case opts.runMetrics != nil:
		opts.runMetrics.Metrics = truncated
	case opts.prMetrics != nil:
		opts.prMetrics.Metrics = truncated
	default:
		opts.repoMetrics = truncated
	}
}

func (opts *MetricsOptions) resolveMetrics(ctx context.Context, client *deepsource.Client, remote *vcs.RemoteData) error {
	var err error
	switch {
	case opts.CommitOid != "":
		opts.runMetrics, err = client.GetRunMetrics(ctx, opts.CommitOid)
	case opts.PRNumber > 0:
		opts.prMetrics, err = client.GetPRMetrics(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, opts.PRNumber)
	case opts.DefaultBranch:
		opts.repoMetrics, err = client.GetRepoMetrics(ctx, remote.Owner, remote.RepoName, remote.VCSProvider)
	default:
		var branchNameFunc func() (string, error)
		if opts.deps != nil {
			branchNameFunc = opts.deps.BranchNameFunc
		}
		ab, abErr := cmdutil.ResolveAutoBranch(ctx, opts.stdout(), client, branchNameFunc, remote)
		if abErr != nil {
			return abErr
		}
		if ab.Empty {
			return nil
		}
		opts.autoDetectedBranch = ab.BranchName
		switch {
		case ab.PRNumber > 0:
			opts.PRNumber = ab.PRNumber
			opts.CommitOid = ab.CommitOid
			opts.prMetrics, err = client.GetPRMetrics(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, ab.PRNumber)
		case ab.UseRepo:
			opts.repoMetrics, err = client.GetRepoMetrics(ctx, remote.Owner, remote.RepoName, remote.VCSProvider)
		default:
			opts.CommitOid = ab.CommitOid
			opts.runMetrics, err = client.GetRunMetrics(ctx, ab.CommitOid)
		}
	}
	return err
}

func (opts *MetricsOptions) getMetrics() []metrics.RepositoryMetric {
	switch {
	case opts.runMetrics != nil:
		return opts.runMetrics.Metrics
	case opts.prMetrics != nil:
		return opts.prMetrics.Metrics
	default:
		return opts.repoMetrics
	}
}

func (opts *MetricsOptions) scopeLabel() string {
	switch {
	case opts.autoDetectedBranch != "":
		if opts.CommitOid == "" {
			return "branch " + opts.autoDetectedBranch
		}
		commitShort := opts.CommitOid
		if len(commitShort) > 8 {
			commitShort = commitShort[:8]
		}
		return fmt.Sprintf("branch %s (%s)", opts.autoDetectedBranch, commitShort)
	case opts.runMetrics != nil:
		commitShort := opts.runMetrics.CommitOid
		if len(commitShort) > 7 {
			commitShort = commitShort[:7]
		}
		return fmt.Sprintf("commit %s on %s", commitShort, opts.runMetrics.BranchName)
	case opts.prMetrics != nil:
		return fmt.Sprintf("PR #%d (%s -> %s)", opts.prMetrics.Number, opts.prMetrics.Branch, opts.prMetrics.BaseBranch)
	default:
		return "default branch"
	}
}

type metricRow struct {
	name      string
	value     string
	threshold string
	status    string
}

func groupMetricsByKey(metricsList []metrics.RepositoryMetric) (map[string][]metricRow, []string, int) {
	grouped := make(map[string][]metricRow)
	var seenKeys []string
	totalItems := 0

	for _, m := range metricsList {
		for _, item := range m.Items {
			threshold := "-"
			if item.Threshold != nil {
				threshold = fmt.Sprintf("%d%s", *item.Threshold, m.Unit)
			}

			status := "-"
			if item.ThresholdStatus != "" {
				status = formatStatus(item.ThresholdStatus)
			}

			value := item.LatestValueDisplay
			if value == "" && item.LatestValue != nil {
				value = fmt.Sprintf("%.1f%s", *item.LatestValue, m.Unit)
			}
			if value == "" {
				value = "-"
			}

			if _, ok := grouped[item.Key]; !ok {
				seenKeys = append(seenKeys, item.Key)
			}
			grouped[item.Key] = append(grouped[item.Key], metricRow{
				name:      m.Name,
				value:     value,
				threshold: threshold,
				status:    status,
			})
			totalItems++
		}
	}

	sort.SliceStable(seenKeys, func(i, j int) bool {
		if seenKeys[i] == "AGGREGATE" {
			return true
		}
		if seenKeys[j] == "AGGREGATE" {
			return false
		}
		return seenKeys[i] < seenKeys[j]
	})

	return grouped, seenKeys, totalItems
}

func (opts *MetricsOptions) outputHuman() error {
	metricsList := opts.getMetrics()
	w := opts.stdout()

	if len(metricsList) == 0 {
		style.Infof(w, "No metrics found in %s on %s.", opts.repoSlug, opts.scopeLabel())
		return nil
	}

	fmt.Fprintln(w, pterm.Bold.Sprintf("── Metrics · %s ────", opts.scopeLabel()))
	fmt.Fprintln(w)

	grouped, seenKeys, totalItems := groupMetricsByKey(metricsList)

	iw := &indentWriter{w: w, prefix: "  "}

	for idx, key := range seenKeys {
		label := strings.ToUpper(key[:1]) + strings.ToLower(key[1:])
		fmt.Fprintln(w, pterm.Bold.Sprintf("  ── %s ──", label))
		fmt.Fprintln(w)

		data := [][]string{{"Metric", "Value", "Threshold", "Status"}}
		for _, r := range grouped[key] {
			data = append(data, []string{r.name, r.value, r.threshold, r.status})
		}
		pterm.DefaultTable.WithHasHeader().WithData(data).WithWriter(iw).Render()

		if idx < len(seenKeys)-1 {
			fmt.Fprintln(w)
		}
	}

	// Changeset stats for run scope
	if opts.runMetrics != nil && opts.runMetrics.ChangesetStats != nil {
		opts.outputChangesetStats(w)
	}

	fmt.Fprintln(w)
	opts.printFooter(w, totalItems)
	return nil
}

func (opts *MetricsOptions) outputChangesetStats(w io.Writer) {
	stats := opts.runMetrics.ChangesetStats
	iw := &indentWriter{w: w, prefix: "  "}

	fmt.Fprintln(w)
	fmt.Fprintln(w, pterm.Bold.Sprint("  Changeset Coverage"))

	header := []string{"Type", "Overall", "Covered", "Overall %", "New", "New Covered", "New %"}
	data := [][]string{header}

	data = append(data, []string{
		"Lines",
		formatIntPtr(stats.Lines.Overall),
		formatIntPtr(stats.Lines.OverallCovered),
		coveragePct(stats.Lines.Overall, stats.Lines.OverallCovered),
		formatIntPtr(stats.Lines.New),
		formatIntPtr(stats.Lines.NewCovered),
		newCoveragePct(stats.Lines.New, stats.Lines.NewCovered),
	}, []string{
		"Branches",
		formatIntPtr(stats.Branches.Overall),
		formatIntPtr(stats.Branches.OverallCovered),
		coveragePct(stats.Branches.Overall, stats.Branches.OverallCovered),
		formatIntPtr(stats.Branches.New),
		formatIntPtr(stats.Branches.NewCovered),
		newCoveragePct(stats.Branches.New, stats.Branches.NewCovered),
	}, []string{
		"Conditions",
		formatIntPtr(stats.Conditions.Overall),
		formatIntPtr(stats.Conditions.OverallCovered),
		coveragePct(stats.Conditions.Overall, stats.Conditions.OverallCovered),
		formatIntPtr(stats.Conditions.New),
		formatIntPtr(stats.Conditions.NewCovered),
		newCoveragePct(stats.Conditions.New, stats.Conditions.NewCovered),
	})

	pterm.DefaultTable.WithHasHeader().WithData(data).WithWriter(iw).Render()

	if opts.Verbose {
		fmt.Fprintln(w)
		fmt.Fprintln(w, pterm.Gray("    Lines:      Executable source code lines — the most common coverage metric."))
		fmt.Fprintln(w, pterm.Gray("    Branches:   Decision branches (if/else, switch arms) — did both paths execute?"))
		fmt.Fprintln(w, pterm.Gray("    Conditions: Individual boolean sub-expressions in compound conditions (a && b)."))
	}
}

func (opts *MetricsOptions) printFooter(w io.Writer, count int) {
	fmt.Fprintf(w, "Showing %d %s in %s from %s\n", count, style.Pluralize(count, "metric", "metrics"), opts.repoSlug, opts.scopeLabel())
}

// indentWriter wraps an io.Writer and prepends a prefix to each line.
type indentWriter struct {
	w      io.Writer
	prefix string
}

func (iw *indentWriter) Write(p []byte) (int, error) {
	lines := strings.Split(string(p), "\n")
	for i, line := range lines {
		if i > 0 {
			fmt.Fprint(iw.w, "\n")
		}
		if line != "" {
			fmt.Fprint(iw.w, iw.prefix+line)
		}
	}
	return len(p), nil
}

func formatStatus(status string) string {
	switch strings.ToUpper(status) {
	case "PASSING":
		return pterm.Green("Passing")
	case "FAILING":
		return pterm.Red("Failing")
	default:
		return status
	}
}

func formatIntPtr(val *int) string {
	if val == nil {
		return "-"
	}
	return fmt.Sprintf("%d", *val)
}

func coveragePct(total, covered *int) string {
	if total == nil || covered == nil || *total == 0 {
		return "-"
	}
	return fmt.Sprintf("%.1f%%", float64(*covered)/float64(*total)*100)
}

func newCoveragePct(total, covered *int) string {
	if total == nil || covered == nil || (*total == 0 && *covered == 0) {
		return "-"
	}
	if *total == 0 {
		return "-"
	}
	return fmt.Sprintf("%.1f%%", float64(*covered)/float64(*total)*100)
}

func (opts *MetricsOptions) outputJSON() error {
	var data []byte
	var err error

	switch {
	case opts.runMetrics != nil:
		data, err = json.MarshalIndent(opts.runMetrics, "", "  ")
	case opts.prMetrics != nil:
		data, err = json.MarshalIndent(opts.prMetrics, "", "  ")
	default:
		data, err = json.MarshalIndent(opts.repoMetrics, "", "  ")
	}
	if err != nil {
		return clierrors.NewCLIError(clierrors.ErrAPIError, "Failed to format JSON output", err)
	}
	fmt.Fprintln(opts.stdout(), string(data))
	return nil
}

func setMetricsUsageFunc(cmd *cobra.Command) {
	cmd.SetUsageFunc(func(c *cobra.Command) error {
		groups := []struct {
			title string
			flags []string
		}{
			{"Scope", []string{"commit", "pr", "default-branch"}},
			{"Output", []string{"output", "limit", "verbose"}},
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
				fmt.Fprintf(w, "  %s\n", metricsFlagUsageLine(f))
			}
		}
		fmt.Fprintln(w)
		return nil
	})
}

func metricsFlagUsageLine(f *pflag.Flag) string {
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

	// Pad to 28 chars for alignment, then add usage.
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
