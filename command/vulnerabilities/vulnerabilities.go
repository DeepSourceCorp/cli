package vulnerabilities

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
	"github.com/deepsourcelabs/cli/deepsource/vulnerabilities"
	"github.com/deepsourcelabs/cli/internal/cli/completion"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
	"github.com/deepsourcelabs/cli/internal/vcs"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
)

type VulnerabilitiesOptions struct {
	RepoArg          string
	CommitOid        string
	PRNumber         int
	DefaultBranch    bool
	OutputFormat     string
	Verbose          bool
	LimitArg         int
	SeverityFilters  []string
	repoSlug         string
	autoDetectedBranch string
	repoVulns        []vulnerabilities.VulnerabilityOccurrence
	runVulns         *vulnerabilities.RunVulns
	prVulns          *vulnerabilities.PRVulns
	deps             *cmddeps.Deps
}

func (opts *VulnerabilitiesOptions) stdout() io.Writer {
	if opts.deps != nil && opts.deps.Stdout != nil {
		return opts.deps.Stdout
	}
	return os.Stdout
}

func NewCmdVulnerabilities() *cobra.Command {
	return NewCmdVulnerabilitiesWithDeps(nil)
}

func NewCmdVulnerabilitiesWithDeps(deps *cmddeps.Deps) *cobra.Command {
	opts := VulnerabilitiesOptions{
		OutputFormat: "pretty",
		LimitArg:     100,
		deps:         deps,
	}

	doc := heredoc.Docf(`
		View dependency vulnerabilities for a repository.

		By default, shows vulnerabilities from the latest analyzed commit on the current branch. Use %[1]s or %[2]s
		to scope to a specific analysis run or pull request, or %[3]s to query
		the default branch.

		Examples:
		  %[4]s
		  %[5]s
		  %[6]s
		  %[7]s
		  %[8]s
		  %[9]s
		`,
		style.Yellow("--commit"),
		style.Yellow("--pr"),
		style.Yellow("--default-branch"),
		style.Cyan("deepsource vulnerabilities"),
		style.Cyan("deepsource vulnerabilities --repo gh/owner/name"),
		style.Cyan("deepsource vulnerabilities --commit abc123f"),
		style.Cyan("deepsource vulnerabilities --pr 123"),
		style.Cyan("deepsource vulnerabilities --severity critical,high"),
		style.Cyan("deepsource vulnerabilities --default-branch"),
	)

	cmd := &cobra.Command{
		Use:   "vulnerabilities [flags]",
		Short: "View dependency vulnerabilities",
		Long:  doc,
		RunE: func(cmd *cobra.Command, _ []string) error {
			return opts.Run(cmd.Context())
		},
	}

	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "Repository in provider/owner/name format (e.g. gh/owner/name). Supported providers: gh, gl, bb, ads")
	cmd.Flags().IntVarP(&opts.LimitArg, "limit", "l", 100, "Maximum number of vulnerabilities to fetch")
	cmd.Flags().StringVarP(&opts.OutputFormat, "output", "o", "pretty", "Output format: pretty, json")
	cmd.Flags().BoolVarP(&opts.Verbose, "verbose", "v", false, "Show CVSS score, summary, fix versions, and reachability")
	cmd.Flags().StringVar(&opts.CommitOid, "commit", "", "Scope to a specific analysis run by commit SHA")
	cmd.Flags().IntVar(&opts.PRNumber, "pr", 0, "Scope to a specific pull request by number")
	cmd.Flags().BoolVar(&opts.DefaultBranch, "default-branch", false, "Show vulnerabilities from the default branch instead of current branch")
	cmd.Flags().StringSliceVar(&opts.SeverityFilters, "severity", nil, "Filter by severity (e.g. critical,high)")

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
	_ = cmd.RegisterFlagCompletionFunc("severity", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return []string{"critical", "high", "medium", "low", "none"}, cobra.ShellCompDirectiveNoFileComp
	})

	cmd.MarkFlagsMutuallyExclusive("commit", "pr", "default-branch")

	setVulnsUsageFunc(cmd)

	return cmd
}

func (opts *VulnerabilitiesOptions) Run(ctx context.Context) error {
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

	if err := opts.resolveVulnerabilities(ctx, client, remote); err != nil {
		return err
	}

	// Apply severity filter if provided
	opts.applyFilters()

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
func (opts *VulnerabilitiesOptions) warnIfLocalChanges() {
	if opts.autoDetectedBranch == "" || len(opts.getVulns()) == 0 {
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
		style.Infof(opts.stdout(), "You have unpushed commits and uncommitted changes on branch %s. Displayed vulnerabilities may not reflect your latest local changes.", opts.autoDetectedBranch)
	case unpushed:
		style.Infof(opts.stdout(), "You have unpushed commits on branch %s. Displayed vulnerabilities may not reflect your latest local changes.", opts.autoDetectedBranch)
	case uncommitted:
		style.Infof(opts.stdout(), "You have uncommitted changes on branch %s. Displayed vulnerabilities may not reflect your latest local changes.", opts.autoDetectedBranch)
	}
}

func (opts *VulnerabilitiesOptions) resolveVulnerabilities(ctx context.Context, client *deepsource.Client, remote *vcs.RemoteData) error {
	var err error
	switch {
	case opts.CommitOid != "":
		opts.runVulns, err = client.GetRunVulns(ctx, opts.CommitOid, opts.LimitArg)
	case opts.PRNumber > 0:
		opts.prVulns, err = client.GetPRVulns(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, opts.PRNumber, opts.LimitArg)
	case opts.DefaultBranch:
		opts.repoVulns, err = client.GetRepoVulns(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, opts.LimitArg)
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
			opts.prVulns, err = client.GetPRVulns(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, ab.PRNumber, opts.LimitArg)
		case ab.UseRepo:
			opts.repoVulns, err = client.GetRepoVulns(ctx, remote.Owner, remote.RepoName, remote.VCSProvider, opts.LimitArg)
		default:
			opts.CommitOid = ab.CommitOid
			opts.runVulns, err = client.GetRunVulns(ctx, ab.CommitOid, opts.LimitArg)
		}
	}
	return err
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

func (opts *VulnerabilitiesOptions) scopeLabel() string {
	switch {
	case opts.autoDetectedBranch != "":
		if opts.CommitOid == "" {
			return opts.autoDetectedBranch
		}
		commitShort := opts.CommitOid
		if len(commitShort) > 8 {
			commitShort = commitShort[:8]
		}
		return fmt.Sprintf("%s (%s)", opts.autoDetectedBranch, commitShort)
	case opts.runVulns != nil:
		commitShort := opts.runVulns.CommitOid
		if len(commitShort) > 7 {
			commitShort = commitShort[:7]
		}
		return fmt.Sprintf("commit %s", commitShort)
	case opts.prVulns != nil:
		return fmt.Sprintf("PR #%d", opts.prVulns.Number)
	default:
		return "default branch"
	}
}

func (opts *VulnerabilitiesOptions) outputHuman() error {
	w := opts.stdout()
	vulnsList := opts.getVulns()

	if len(vulnsList) == 0 {
		if opts.hasFilters() {
			style.Infof(opts.stdout(), "No vulnerabilities matched the provided filters in %s on %s.", opts.repoSlug, opts.scopeLabel())
		} else {
			style.Infof(opts.stdout(), "No vulnerabilities found in %s on %s.", opts.repoSlug, opts.scopeLabel())
		}
		return nil
	}

	// Summary header
	fmt.Fprintln(w, pterm.Bold.Sprintf("── Vulnerabilities · %s ────", opts.scopeLabel()))

	// Severity counts
	sevCounts := map[string]int{}
	for _, v := range vulnsList {
		sev := strings.ToUpper(v.Vulnerability.Severity)
		sevCounts[sev]++
	}
	var sevParts []string
	for _, sev := range []string{"CRITICAL", "HIGH", "MEDIUM", "LOW", "NONE"} {
		if c := sevCounts[sev]; c > 0 {
			sevParts = append(sevParts, style.VulnSeverityColor(sev, fmt.Sprintf("%d %s", c, strings.ToLower(humanizeSeverity(sev)))))
		}
	}
	summaryLine := fmt.Sprintf("   %d total", len(vulnsList))
	if len(sevParts) > 0 {
		summaryLine += " · " + strings.Join(sevParts, " · ")
	}
	fmt.Fprintln(w, summaryLine)

	reachableCount := 0
	for _, v := range vulnsList {
		if strings.EqualFold(v.Reachability, "REACHABLE") {
			reachableCount++
		}
	}
	if reachableCount > 0 {
		fmt.Fprintln(w, "   "+pterm.Red(fmt.Sprintf("%d reachable", reachableCount)))
	}
	fmt.Fprintln(w)

	// Group vulnerabilities by severity
	grouped := make(map[string][]vulnerabilities.VulnerabilityOccurrence)
	for _, v := range vulnsList {
		sev := strings.ToUpper(v.Vulnerability.Severity)
		grouped[sev] = append(grouped[sev], v)
	}

	severityOrder := []string{"CRITICAL", "HIGH", "MEDIUM", "LOW", "NONE"}
	for _, sev := range severityOrder {
		group, ok := grouped[sev]
		if !ok {
			continue
		}

		fmt.Fprintln(w, pterm.Bold.Sprintf("  ── %s ──", style.VulnSeverityColor(sev, humanizeSeverity(sev))))

		header := []string{"ID", "Package", "Version", "Ecosystem", "Fix", "Reachability"}
		data := [][]string{header}
		for _, v := range group {
			fix := "-"
			if len(v.Vulnerability.FixedVersions) > 0 {
				fix = v.Vulnerability.FixedVersions[0]
			}
			data = append(data, []string{
				v.Vulnerability.Identifier,
				v.Package.Name,
				v.PackageVersion.Version,
				humanizeEcosystem(v.Package.Ecosystem),
				fix,
				formatReachability(v.Reachability),
			})
		}
		iw := &indentWriter{w: w, prefix: "  "}
		pterm.DefaultTable.WithHasHeader().WithData(data).WithWriter(iw).Render()
		fmt.Fprintln(w)
	}

	fmt.Fprintf(w, "Showing %d %s in %s from %s\n", len(vulnsList), style.Pluralize(len(vulnsList), "vulnerability", "vulnerabilities"), opts.repoSlug, opts.scopeLabel())
	return nil
}

func formatReachability(reachability string) string {
	switch strings.ToUpper(reachability) {
	case "REACHABLE":
		return pterm.Red("Yes")
	case "UNREACHABLE":
		return pterm.Green("No")
	default:
		return "Unknown"
	}
}

func humanizeEcosystem(ecosystem string) string {
	switch strings.ToUpper(ecosystem) {
	case "GO":
		return "Go"
	case "NPM":
		return "npm"
	case "PYPI":
		return "PyPI"
	case "MAVEN":
		return "Maven"
	case "RUBYGEMS":
		return "RubyGems"
	case "NUGET":
		return "NuGet"
	case "CARGO":
		return "Cargo"
	case "PACKAGIST":
		return "Packagist"
	default:
		if ecosystem == "" {
			return "-"
		}
		return ecosystem
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
	fmt.Fprintln(opts.stdout(), string(data))
	return nil
}

func setVulnsUsageFunc(cmd *cobra.Command) {
	cmd.SetUsageFunc(func(c *cobra.Command) error {
		groups := []struct {
			title string
			flags []string
		}{
			{"Scope", []string{"commit", "pr", "default-branch"}},
			{"Filters", []string{"severity"}},
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
				fmt.Fprintf(w, "  %s\n", vulnsFlagUsageLine(f))
			}
		}
		fmt.Fprintln(w)
		return nil
	})
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

func vulnsFlagUsageLine(f *pflag.Flag) string {
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
	case "stringSlice":
		line += " strings"
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

