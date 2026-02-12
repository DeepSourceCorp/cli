package metrics

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/MakeNowJust/heredoc"
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
	RunOid       string
	PRNumber     int
	OutputFormat string
	repoMetrics  []metrics.RepositoryMetric
	runMetrics   *metrics.RunMetrics
	prMetrics    *metrics.PRMetrics
}

func NewCmdMetrics() *cobra.Command {
	opts := MetricsOptions{
		OutputFormat: "table",
	}

	doc := heredoc.Docf(`
		View code metrics for a repository.

		By default, shows metrics from the default branch. Use %[1]s or %[2]s
		to scope to a specific run or pull request.

		Examples:
		  %[3]s
		  %[4]s
		  %[5]s
		  %[6]s
		`,
		style.Yellow("--run"),
		style.Yellow("--pr"),
		style.Cyan("deepsource metrics"),
		style.Cyan("deepsource metrics --repo owner/repo"),
		style.Cyan("deepsource metrics --run abc123f"),
		style.Cyan("deepsource metrics --pr 123"),
	)

	cmd := &cobra.Command{
		Use:   "metrics",
		Short: "View repository metrics",
		Long:  doc,
		RunE: func(cmd *cobra.Command, args []string) error {
			return opts.Run(cmd.Context())
		},
	}

	// --repo, -r flag
	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "Repository (owner/name)")

	// Scoping flags
	cmd.Flags().StringVar(&opts.RunOid, "run", "", "Scope to a specific run by commit OID")
	cmd.Flags().IntVar(&opts.PRNumber, "pr", 0, "Scope to a specific pull request by number")

	// --output flag
	cmd.Flags().StringVarP(&opts.OutputFormat, "output", "o", "table", "Output format: table, json, yaml")

	// Completions
	_ = cmd.RegisterFlagCompletionFunc("repo", func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
		return completion.RepoCompletionCandidates(), cobra.ShellCompDirectiveNoFileComp
	})
	_ = cmd.RegisterFlagCompletionFunc("output", func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
		return []string{
			"table\tHuman-readable table",
			"json\tJSON output",
			"yaml\tYAML output",
		}, cobra.ShellCompDirectiveNoFileComp
	})

	// Mutual exclusivity
	cmd.MarkFlagsMutuallyExclusive("run", "pr")

	return cmd
}

func (opts *MetricsOptions) Run(ctx context.Context) error {
	// Load configuration
	cfgMgr := config.DefaultManager()
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

	// Create DeepSource client
	client, err := deepsource.New(deepsource.ClientOpts{
		Token:            cfg.Token,
		HostName:         cfg.Host,
		OnTokenRefreshed: cfgMgr.TokenRefreshCallback(),
	})
	if err != nil {
		return err
	}

	// Fetch metrics based on scope
	switch {
	case opts.RunOid != "":
		opts.runMetrics, err = client.GetRunMetrics(ctx, opts.RunOid)
	case opts.PRNumber > 0:
		opts.prMetrics, err = client.GetPRMetrics(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, opts.PRNumber)
	default:
		opts.repoMetrics, err = client.GetRepoMetrics(ctx, remote.Owner, remote.RepoName, remote.VCSProvider)
	}
	if err != nil {
		return err
	}

	// Output based on format
	switch opts.OutputFormat {
	case "json":
		return opts.outputJSON()
	case "yaml":
		return opts.outputYAML()
	default:
		return opts.outputTable()
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

func formatStatus(status string) string {
	switch strings.ToUpper(status) {
	case "PASSING":
		return pterm.Green(status)
	case "FAILING":
		return pterm.Red(status)
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
	fmt.Println(string(data))
	return nil
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
	fmt.Print(string(data))
	return nil
}
