package vulnerabilities

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/vulnerabilities"
	"github.com/deepsourcelabs/cli/internal/cli/completion"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
	"github.com/deepsourcelabs/cli/internal/vcs"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
	"gopkg.in/yaml.v3"
)

type VulnerabilitiesOptions struct {
	RepoArg         string
	RunOid          string
	PRNumber        int
	OutputFormat    string
	LimitArg        int
	SeverityFilters []string
	repoVulns       []vulnerabilities.VulnerabilityOccurrence
	runVulns        *vulnerabilities.RunVulns
	prVulns         *vulnerabilities.PRVulns
}

func NewCmdVulnerabilities() *cobra.Command {
	opts := VulnerabilitiesOptions{
		OutputFormat: "table",
		LimitArg:     100,
	}

	doc := heredoc.Docf(`
		View dependency vulnerabilities for a repository.

		By default, shows vulnerabilities from the default branch. Use %[1]s or %[2]s
		to scope to a specific run or pull request.

		Examples:
		  %[3]s
		  %[4]s
		  %[5]s
		  %[6]s
		  %[7]s
		`,
		style.Yellow("--run"),
		style.Yellow("--pr"),
		style.Cyan("deepsource vulnerabilities"),
		style.Cyan("deepsource vulnerabilities --repo owner/repo"),
		style.Cyan("deepsource vulnerabilities --run abc123f"),
		style.Cyan("deepsource vulnerabilities --pr 123"),
		style.Cyan("deepsource vulnerabilities --severity critical,high"),
	)

	cmd := &cobra.Command{
		Use:   "vulnerabilities",
		Short: "View dependency vulnerabilities",
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

	// --limit flag
	cmd.Flags().IntVarP(&opts.LimitArg, "limit", "l", 100, "Maximum number of vulnerabilities to fetch")

	// --severity filter flag
	cmd.Flags().StringArrayVar(&opts.SeverityFilters, "severity", nil, "Filter by severity (repeatable)")

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
	_ = cmd.RegisterFlagCompletionFunc("severity", func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
		return []string{"critical", "high", "medium", "low", "none"}, cobra.ShellCompDirectiveNoFileComp
	})

	// Mutual exclusivity
	cmd.MarkFlagsMutuallyExclusive("run", "pr")

	return cmd
}

func (opts *VulnerabilitiesOptions) Run(ctx context.Context) error {
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

	// Fetch vulnerabilities based on scope
	switch {
	case opts.RunOid != "":
		opts.runVulns, err = client.GetRunVulns(ctx, opts.RunOid, opts.LimitArg)
	case opts.PRNumber > 0:
		opts.prVulns, err = client.GetPRVulns(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, opts.PRNumber, opts.LimitArg)
	default:
		opts.repoVulns, err = client.GetRepoVulns(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, opts.LimitArg)
	}
	if err != nil {
		return err
	}

	// Apply severity filter if provided
	opts.applyFilters()

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

func (opts *VulnerabilitiesOptions) getVulns() []vulnerabilities.VulnerabilityOccurrence {
	switch {
	case opts.runVulns != nil:
		return opts.runVulns.Vulns
	case opts.prVulns != nil:
		return opts.prVulns.Vulns
	default:
		return opts.repoVulns
	}
}

func (opts *VulnerabilitiesOptions) applyFilters() {
	if len(opts.SeverityFilters) == 0 {
		return
	}

	severitySet := make(map[string]struct{})
	for _, s := range opts.SeverityFilters {
		severitySet[strings.ToUpper(strings.TrimSpace(s))] = struct{}{}
	}

	filterVulns := func(vulnsList []vulnerabilities.VulnerabilityOccurrence) []vulnerabilities.VulnerabilityOccurrence {
		filtered := make([]vulnerabilities.VulnerabilityOccurrence, 0)
		for _, v := range vulnsList {
			if _, ok := severitySet[strings.ToUpper(v.Vulnerability.Severity)]; ok {
				filtered = append(filtered, v)
			}
		}
		return filtered
	}

	switch {
	case opts.runVulns != nil:
		opts.runVulns.Vulns = filterVulns(opts.runVulns.Vulns)
	case opts.prVulns != nil:
		opts.prVulns.Vulns = filterVulns(opts.prVulns.Vulns)
	default:
		opts.repoVulns = filterVulns(opts.repoVulns)
	}
}

func (opts *VulnerabilitiesOptions) outputTable() error {
	vulnsList := opts.getVulns()

	if len(vulnsList) == 0 {
		pterm.Info.Println("No vulnerabilities found.")
		return nil
	}

	// Show context header for run/PR scopes
	if opts.runVulns != nil {
		commitShort := opts.runVulns.CommitOid
		if len(commitShort) > 8 {
			commitShort = commitShort[:8]
		}
		pterm.DefaultBox.WithTitle("Run Vulnerabilities").WithTitleTopCenter().Println(
			fmt.Sprintf("%s %s\n%s %s",
				pterm.Bold.Sprint("Commit:"),
				commitShort,
				pterm.Bold.Sprint("Branch:"),
				opts.runVulns.BranchName,
			),
		)
		pterm.Println()
	} else if opts.prVulns != nil {
		pterm.DefaultBox.WithTitle("Pull Request Vulnerabilities").WithTitleTopCenter().Println(
			fmt.Sprintf("%s #%d\n%s %s",
				pterm.Bold.Sprint("PR:"),
				opts.prVulns.Number,
				pterm.Bold.Sprint("Branch:"),
				opts.prVulns.Branch,
			),
		)
		pterm.Println()
	}

	// Build vulnerabilities table
	header := []string{"ID", "SEVERITY", "PACKAGE", "VERSION", "FIX", "REACHABLE"}
	data := [][]string{header}

	for _, v := range vulnsList {
		fix := "-"
		if len(v.Vulnerability.FixedVersions) > 0 {
			fix = v.Vulnerability.FixedVersions[0]
		}

		reachable := formatReachability(v.Reachability)
		severity := formatSeverity(v.Vulnerability.Severity)

		data = append(data, []string{
			v.Vulnerability.Identifier,
			severity,
			v.Package.Name,
			v.PackageVersion.Version,
			fix,
			reachable,
		})
	}

	pterm.DefaultTable.WithHasHeader().WithData(data).Render()
	pterm.Printf("\nShowing %d vulnerability(ies)\n", len(vulnsList))

	return nil
}

func formatSeverity(severity string) string {
	switch strings.ToUpper(severity) {
	case "CRITICAL":
		return pterm.Red(severity)
	case "HIGH":
		return pterm.LightRed(severity)
	case "MEDIUM":
		return pterm.Yellow(severity)
	case "LOW":
		return pterm.Blue(severity)
	default:
		return severity
	}
}

func formatReachability(reachability string) string {
	switch strings.ToUpper(reachability) {
	case "REACHABLE":
		return pterm.Red("YES")
	case "UNREACHABLE":
		return pterm.Green("NO")
	default:
		return "UNKNOWN"
	}
}

func (opts *VulnerabilitiesOptions) outputJSON() error {
	var data []byte
	var err error

	switch {
	case opts.runVulns != nil:
		data, err = json.MarshalIndent(opts.runVulns, "", "  ")
	case opts.prVulns != nil:
		data, err = json.MarshalIndent(opts.prVulns, "", "  ")
	default:
		data, err = json.MarshalIndent(opts.repoVulns, "", "  ")
	}
	if err != nil {
		return clierrors.NewCLIError(clierrors.ErrAPIError, "Failed to format JSON output", err)
	}
	fmt.Println(string(data))
	return nil
}

func (opts *VulnerabilitiesOptions) outputYAML() error {
	var data []byte
	var err error

	switch {
	case opts.runVulns != nil:
		data, err = yaml.Marshal(opts.runVulns)
	case opts.prVulns != nil:
		data, err = yaml.Marshal(opts.prVulns)
	default:
		data, err = yaml.Marshal(opts.repoVulns)
	}
	if err != nil {
		return clierrors.NewCLIError(clierrors.ErrAPIError, "Failed to format YAML output", err)
	}
	fmt.Print(string(data))
	return nil
}
