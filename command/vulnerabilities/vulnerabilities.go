package vulnerabilities

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
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
	CommitOid       string
	PRNumber        int
	OutputFormat    string
	OutputFile      string
	Verbose         bool
	LimitArg        int
	SeverityFilters []string
	repoSlug        string
	repoVulns       []vulnerabilities.VulnerabilityOccurrence
	runVulns        *vulnerabilities.RunVulns
	prVulns         *vulnerabilities.PRVulns
}

func NewCmdVulnerabilities() *cobra.Command {
	opts := VulnerabilitiesOptions{
		OutputFormat: "human",
		LimitArg:     100,
	}

	doc := heredoc.Docf(`
		View dependency vulnerabilities for a repository.

		By default, shows vulnerabilities from the default branch. Use %[1]s or %[2]s
		to scope to a specific analysis run or pull request.

		Examples:
		  %[3]s
		  %[4]s
		  %[5]s
		  %[6]s
		  %[7]s
		`,
		style.Yellow("--commit"),
		style.Yellow("--pr"),
		style.Cyan("deepsource vulnerabilities"),
		style.Cyan("deepsource vulnerabilities --repo owner/repo"),
		style.Cyan("deepsource vulnerabilities --commit abc123f"),
		style.Cyan("deepsource vulnerabilities --pr 123"),
		style.Cyan("deepsource vulnerabilities --severity critical,high"),
	)

	cmd := &cobra.Command{
		Use:   "vulnerabilities [flags]",
		Short: "View dependency vulnerabilities",
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
	cmd.Flags().StringVarP(&opts.OutputFormat, "output", "o", "human", "Output format: human, table, json, yaml")

	// --output-file flag
	cmd.Flags().StringVar(&opts.OutputFile, "output-file", "", "Write output to a file instead of stdout")

	// --verbose, -v flag
	cmd.Flags().BoolVarP(&opts.Verbose, "verbose", "v", false, "Show CVSS score, summary, fix versions, and reachability")

	// --limit flag
	cmd.Flags().IntVarP(&opts.LimitArg, "limit", "l", 100, "Maximum number of vulnerabilities to fetch")

	// --severity filter flag
	cmd.Flags().StringSliceVar(&opts.SeverityFilters, "severity", nil, "Filter by severity (e.g. critical,high)")

	// Completions
	_ = cmd.RegisterFlagCompletionFunc("repo", func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
		return completion.RepoCompletionCandidates(), cobra.ShellCompDirectiveNoFileComp
	})
	_ = cmd.RegisterFlagCompletionFunc("output", func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
		return []string{
			"human\tHuman-readable grouped output",
			"table\tTabular output",
			"json\tJSON output",
			"yaml\tYAML output",
		}, cobra.ShellCompDirectiveNoFileComp
	})
	_ = cmd.RegisterFlagCompletionFunc("severity", func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
		return []string{"critical", "high", "medium", "low", "none"}, cobra.ShellCompDirectiveNoFileComp
	})

	// Mutual exclusivity
	cmd.MarkFlagsMutuallyExclusive("commit", "pr")

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
	opts.repoSlug = remote.Owner + "/" + remote.RepoName

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
	case opts.CommitOid != "":
		opts.runVulns, err = client.GetRunVulns(ctx, opts.CommitOid, opts.LimitArg)
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
	case "table":
		return opts.outputTable()
	default:
		return opts.outputHuman()
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

func (opts *VulnerabilitiesOptions) hasFilters() bool {
	return len(opts.SeverityFilters) > 0
}

func (opts *VulnerabilitiesOptions) outputHuman() error {
	vulnsList := opts.getVulns()

	if len(vulnsList) == 0 {
		if opts.hasFilters() {
			pterm.Info.Println("No vulnerabilities matched the provided filters.")
		} else {
			pterm.Info.Println("No vulnerabilities found.")
		}
		return nil
	}

	severityOrder := []string{"CRITICAL", "HIGH", "MEDIUM", "LOW", "NONE"}
	groups := make(map[string][]vulnerabilities.VulnerabilityOccurrence)
	for _, v := range vulnsList {
		sev := strings.ToUpper(v.Vulnerability.Severity)
		groups[sev] = append(groups[sev], v)
	}

	for _, sev := range severityOrder {
		group, ok := groups[sev]
		if !ok || len(group) == 0 {
			continue
		}

		header := fmt.Sprintf("%s (%d)", humanizeSeverity(sev), len(group))
		fmt.Println(colorSeverity(sev, header))
		fmt.Println()

		for _, v := range group {
			ecosystem := v.Package.Ecosystem
			if ecosystem == "" {
				ecosystem = "unknown"
			}
			fmt.Printf("  %s: %s@%s (%s)\n",
				v.Vulnerability.Identifier,
				v.Package.Name,
				v.PackageVersion.Version,
				ecosystem,
			)

			if opts.Verbose {
				if v.Vulnerability.CvssV3BaseScore != nil {
					fmt.Printf("    CVSS: %.1f\n", *v.Vulnerability.CvssV3BaseScore)
				}
				if v.Vulnerability.Summary != "" {
					fmt.Printf("    %s\n", v.Vulnerability.Summary)
				}
				if len(v.Vulnerability.FixedVersions) > 0 {
					fmt.Printf("    Fixed in: %s\n", strings.Join(v.Vulnerability.FixedVersions, ", "))
				}
				if v.Reachability != "" {
					fmt.Printf("    Reachability: %s\n", strings.ToLower(v.Reachability))
				}
				if v.Fixability != "" {
					fmt.Printf("    Fixability: %s\n", strings.ToLower(v.Fixability))
				}
				fmt.Println()
			}
		}

		if !opts.Verbose {
			fmt.Println()
		}
	}

	fmt.Printf("Showing %d vulnerability(ies) in %s", len(vulnsList), opts.repoSlug)
	switch {
	case opts.runVulns != nil:
		commitShort := opts.runVulns.CommitOid
		if len(commitShort) > 7 {
			commitShort = commitShort[:7]
		}
		fmt.Printf(" from commit %s\n", commitShort)
	case opts.prVulns != nil:
		fmt.Printf(" from PR #%d\n", opts.prVulns.Number)
	default:
		fmt.Println(" from default branch")
	}
	return nil
}

func (opts *VulnerabilitiesOptions) outputTable() error {
	vulnsList := opts.getVulns()

	if len(vulnsList) == 0 {
		if opts.hasFilters() {
			pterm.Info.Println("No vulnerabilities matched the provided filters.")
		} else {
			pterm.Info.Println("No vulnerabilities found.")
		}
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

func humanizeSeverity(s string) string {
	switch strings.ToUpper(s) {
	case "CRITICAL":
		return "Critical"
	case "HIGH":
		return "High"
	case "MEDIUM":
		return "Medium"
	case "LOW":
		return "Low"
	case "NONE":
		return "None"
	default:
		return s
	}
}

func colorSeverity(sev string, text string) string {
	switch strings.ToUpper(sev) {
	case "CRITICAL":
		return pterm.Red(text)
	case "HIGH":
		return pterm.LightRed(text)
	case "MEDIUM":
		return pterm.Yellow(text)
	case "LOW":
		return pterm.Blue(text)
	default:
		return text
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
	return opts.writeOutput(data, true)
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
	return opts.writeOutput(data, false)
}

func (opts *VulnerabilitiesOptions) writeOutput(data []byte, trailingNewline bool) error {
	if opts.OutputFile == "" {
		if trailingNewline {
			fmt.Println(string(data))
		} else {
			fmt.Print(string(data))
		}
		return nil
	}

	if err := os.WriteFile(opts.OutputFile, data, 0644); err != nil {
		return clierrors.NewCLIError(clierrors.ErrAPIError, "Failed to write output file", err)
	}
	pterm.Printf("Saved vulnerabilities to %s!\n", opts.OutputFile)
	return nil
}
