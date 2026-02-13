package metrics

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/command/cmddeps"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/metrics"
	"github.com/deepsourcelabs/cli/internal/cli/completion"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
	"github.com/deepsourcelabs/cli/internal/vcs"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
	"gopkg.in/yaml.v3"
)

type MetricsOptions struct {
	RepoArg      string
	CommitOid    string
	PRNumber     int
	OutputFormat string
	OutputFile   string
	Verbose      bool
	LimitArg     int
	repoSlug     string
	repoMetrics  []metrics.RepositoryMetric
	runMetrics   *metrics.RunMetrics
	prMetrics    *metrics.PRMetrics
	deps         *cmddeps.Deps
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

		By default, shows metrics from the default branch. Use %[1]s or %[2]s
		to scope to a specific analysis run or pull request.

		Examples:
		  %[3]s
		  %[4]s
		  %[5]s
		  %[6]s
		`,
		style.Yellow("--commit"),
		style.Yellow("--pr"),
		style.Cyan("deepsource metrics"),
		style.Cyan("deepsource metrics --repo owner/repo"),
		style.Cyan("deepsource metrics --commit abc123f"),
		style.Cyan("deepsource metrics --pr 123"),
	)

	cmd := &cobra.Command{
		Use:   "metrics [flags]",
		Short: "View repository metrics",
		Long:  doc,
		RunE: func(cmd *cobra.Command, args []string) error {
			return opts.Run(cmd.Context())
		},
	}

	// --repo, -r flag
	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "Repository (owner/name)")

	// Scoping flags
	cmd.Flags().StringVar(&opts.CommitOid, "commit", "", "Scope to a specific analysis run by commit OID")
	cmd.Flags().IntVar(&opts.PRNumber, "pr", 0, "Scope to a specific pull request by number")

	// --output flag
	cmd.Flags().StringVarP(&opts.OutputFormat, "output", "o", "pretty", "Output format: pretty, table, json, yaml")

	// --output-file flag
	cmd.Flags().StringVar(&opts.OutputFile, "output-file", "", "Write output to a file instead of stdout")

	// --verbose, -v flag
	cmd.Flags().BoolVarP(&opts.Verbose, "verbose", "v", false, "Show shortcodes and descriptions")

	// --limit, -l flag
	cmd.Flags().IntVarP(&opts.LimitArg, "limit", "l", 30, "Maximum number of metrics to fetch")

	// Completions
	_ = cmd.RegisterFlagCompletionFunc("repo", func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
		return completion.RepoCompletionCandidates(), cobra.ShellCompDirectiveNoFileComp
	})
	_ = cmd.RegisterFlagCompletionFunc("output", func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
		return []string{
			"pretty\tPretty-printed grouped output",
			"table\tTabular output",
			"json\tJSON output",
			"yaml\tYAML output",
		}, cobra.ShellCompDirectiveNoFileComp
	})

	// Mutual exclusivity
	cmd.MarkFlagsMutuallyExclusive("commit", "pr")

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

	// Fetch metrics based on scope
	switch {
	case opts.CommitOid != "":
		opts.runMetrics, err = client.GetRunMetrics(ctx, opts.CommitOid)
	case opts.PRNumber > 0:
		opts.prMetrics, err = client.GetPRMetrics(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, opts.PRNumber)
	default:
		opts.repoMetrics, err = client.GetRepoMetrics(ctx, remote.Owner, remote.RepoName, remote.VCSProvider)
	}
	if err != nil {
		return err
	}

	// Apply client-side limit
	if opts.LimitArg > 0 {
		if metricsList := opts.getMetrics(); len(metricsList) > opts.LimitArg {
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
	}

	// Output based on format
	switch opts.OutputFormat {
	case "json":
		return opts.outputJSON()
	case "yaml":
		return opts.outputYAML()
	case "table":
		return opts.outputTable()
	default:
		return opts.outputHuman()
	}
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

func (opts *MetricsOptions) outputTable() error {
	metricsList := opts.getMetrics()

	if len(metricsList) == 0 {
		pterm.Info.Println("No metrics found.")
		return nil
	}

	// Show context header for run/PR scopes
	if opts.runMetrics != nil {
		commitShort := opts.runMetrics.CommitOid
		if len(commitShort) > 8 {
			commitShort = commitShort[:8]
		}
		pterm.DefaultBox.WithTitle("Run Metrics").WithTitleTopCenter().Println(
			fmt.Sprintf("%s %s\n%s %s",
				pterm.Bold.Sprint("Commit:"),
				commitShort,
				pterm.Bold.Sprint("Branch:"),
				opts.runMetrics.BranchName,
			),
		)
		pterm.Println()
	} else if opts.prMetrics != nil {
		pterm.DefaultBox.WithTitle("Pull Request Metrics").WithTitleTopCenter().Println(
			fmt.Sprintf("%s #%d\n%s %s",
				pterm.Bold.Sprint("PR:"),
				opts.prMetrics.Number,
				pterm.Bold.Sprint("Branch:"),
				opts.prMetrics.Branch,
			),
		)
		pterm.Println()
	}

	// Build metrics table
	header := []string{"METRIC", "KEY", "VALUE", "THRESHOLD", "STATUS"}
	data := [][]string{header}

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

			data = append(data, []string{
				m.Name,
				item.Key,
				value,
				threshold,
				status,
			})
		}
	}

	pterm.DefaultTable.WithHasHeader().WithData(data).Render()

	// Show changeset stats for run scope
	if opts.runMetrics != nil && opts.runMetrics.ChangesetStats != nil {
		pterm.Println()
		opts.outputChangesetStats()
	}

	return nil
}

func (opts *MetricsOptions) outputChangesetStats() {
	stats := opts.runMetrics.ChangesetStats

	pterm.DefaultSection.Println("Changeset Coverage")

	header := []string{"TYPE", "OVERALL", "COVERED", "NEW", "NEW COVERED"}
	data := [][]string{header}

	// Lines
	data = append(data, []string{
		"Lines",
		formatIntPtr(stats.Lines.Overall),
		formatIntPtr(stats.Lines.OverallCovered),
		formatIntPtr(stats.Lines.New),
		formatIntPtr(stats.Lines.NewCovered),
	})

	// Branches
	data = append(data, []string{
		"Branches",
		formatIntPtr(stats.Branches.Overall),
		formatIntPtr(stats.Branches.OverallCovered),
		formatIntPtr(stats.Branches.New),
		formatIntPtr(stats.Branches.NewCovered),
	})

	// Conditions
	data = append(data, []string{
		"Conditions",
		formatIntPtr(stats.Conditions.Overall),
		formatIntPtr(stats.Conditions.OverallCovered),
		formatIntPtr(stats.Conditions.New),
		formatIntPtr(stats.Conditions.NewCovered),
	})

	pterm.DefaultTable.WithHasHeader().WithData(data).Render()
}

func (opts *MetricsOptions) outputHuman() error {
	metricsList := opts.getMetrics()

	if len(metricsList) == 0 {
		pterm.Info.Println("No metrics found.")
		return nil
	}

	totalItems := 0
	for _, m := range metricsList {
		// Metric name header (bold)
		header := pterm.Bold.Sprint(m.Name)
		if opts.Verbose && m.Shortcode != "" {
			header += fmt.Sprintf(" (%s)", m.Shortcode)
		}
		fmt.Println(header)

		if opts.Verbose && m.Description != "" {
			fmt.Printf("  %s\n", m.Description)
		}

		for _, item := range m.Items {
			value := formatValueDisplay(item, m.Unit)
			colored := colorByStatus(value, item.ThresholdStatus)
			threshold := formatThresholdDisplay(item, m.Unit)

			fmt.Printf("  %s: %s%s\n", item.Key, colored, threshold)
			totalItems++
		}

		fmt.Println()
	}

	// Changeset stats for run scope
	if opts.runMetrics != nil && opts.runMetrics.ChangesetStats != nil {
		opts.outputHumanChangesetStats()
		fmt.Println()
	}

	opts.printFooter(totalItems)
	return nil
}

func (opts *MetricsOptions) outputHumanChangesetStats() {
	stats := opts.runMetrics.ChangesetStats

	fmt.Println(pterm.Bold.Sprint("Changeset Coverage"))
	printChangesetLine("Lines", stats.Lines)
	printChangesetLine("Branches", stats.Branches)
	printChangesetLine("Conditions", stats.Conditions)
}

func formatValueDisplay(item metrics.RepositoryMetricItem, unit string) string {
	if item.LatestValueDisplay != "" {
		return item.LatestValueDisplay
	}
	if item.LatestValue != nil {
		return fmt.Sprintf("%.1f%s", *item.LatestValue, unit)
	}
	return "-"
}

func formatThresholdDisplay(item metrics.RepositoryMetricItem, unit string) string {
	if item.Threshold == nil {
		return ""
	}
	return fmt.Sprintf(" (threshold: %d%s)", *item.Threshold, unit)
}

func colorByStatus(text string, status string) string {
	switch strings.ToUpper(status) {
	case "PASSING":
		return pterm.Green(text)
	case "FAILING":
		return pterm.Red(text)
	default:
		return text
	}
}

func printChangesetLine(label string, counts metrics.ChangesetStatsCounts) {
	overall := intPtrVal(counts.Overall)
	overallCovered := intPtrVal(counts.OverallCovered)
	new := intPtrVal(counts.New)
	newCovered := intPtrVal(counts.NewCovered)
	fmt.Printf("  %s: %d covered of %d overall, %d covered of %d new\n",
		label, overallCovered, overall, newCovered, new)
}

func intPtrVal(v *int) int {
	if v == nil {
		return 0
	}
	return *v
}

func (opts *MetricsOptions) printFooter(count int) {
	fmt.Printf("Showing %d metric(s) in %s", count, opts.repoSlug)
	switch {
	case opts.runMetrics != nil:
		commitShort := opts.runMetrics.CommitOid
		if len(commitShort) > 7 {
			commitShort = commitShort[:7]
		}
		fmt.Printf(" from commit %s on %s\n", commitShort, opts.runMetrics.BranchName)
	case opts.prMetrics != nil:
		fmt.Printf(" from PR #%d (%s -> %s)\n", opts.prMetrics.Number, opts.prMetrics.Branch, opts.prMetrics.BaseBranch)
	default:
		fmt.Println(" from default branch")
	}
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
	return opts.writeOutput(data, true)
}

func (opts *MetricsOptions) outputYAML() error {
	var data []byte
	var err error

	switch {
	case opts.runMetrics != nil:
		data, err = yaml.Marshal(opts.runMetrics)
	case opts.prMetrics != nil:
		data, err = yaml.Marshal(opts.prMetrics)
	default:
		data, err = yaml.Marshal(opts.repoMetrics)
	}
	if err != nil {
		return clierrors.NewCLIError(clierrors.ErrAPIError, "Failed to format YAML output", err)
	}
	return opts.writeOutput(data, false)
}

func (opts *MetricsOptions) writeOutput(data []byte, trailingNewline bool) error {
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
	pterm.Printf("Saved metrics to %s!\n", opts.OutputFile)
	return nil
}
