package status

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
	"github.com/deepsourcelabs/cli/internal/cli/args"
	"github.com/deepsourcelabs/cli/internal/cli/completion"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	reposvc "github.com/deepsourcelabs/cli/internal/services/repo"
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
)

type RepoStatusOptions struct {
	RepoArg string
	Output  string
	deps    *cmddeps.Deps
}

func (opts *RepoStatusOptions) stdout() io.Writer {
	if opts.deps != nil && opts.deps.Stdout != nil {
		return opts.deps.Stdout
	}
	return os.Stdout
}

func NewCmdRepoStatus() *cobra.Command {
	return NewCmdRepoStatusWithDeps(nil)
}

func NewCmdRepoStatusWithDeps(deps *cmddeps.Deps) *cobra.Command {
	opts := RepoStatusOptions{
		deps: deps,
	}

	doc := heredoc.Docf(`
		View the status and enabled analyzers for the repository.

		To check the status of the current repository on DeepSource, run:
		%[1]s

		To check a specific repository, use the %[2]s flag:
		%[3]s
		`, style.Cyan("deepsource repo status"), style.Yellow("--repo"), style.Cyan("deepsource repo status --repo gh/owner/name"))

	cmd := &cobra.Command{
		Use:   "status",
		Short: "View the status and enabled analyzers for the repository.",
		Long:  doc,
		Args:  args.NoArgs,
		RunE: func(_ *cobra.Command, _ []string) error {
			return opts.Run()
		},
	}

	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "Repository in provider/owner/name format (e.g. gh/owner/name). Supported providers: gh, gl, bb, ads")
	cmd.Flags().StringVarP(&opts.Output, "output", "o", "pretty", "Output format: pretty, json")
	_ = cmd.RegisterFlagCompletionFunc("repo", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return completion.RepoCompletionCandidates(), cobra.ShellCompDirectiveNoFileComp
	})
	_ = cmd.RegisterFlagCompletionFunc("output", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return []string{
			"pretty\tPretty-printed output",
			"json\tJSON output",
		}, cobra.ShellCompDirectiveNoFileComp
	})

	setRepoStatusUsageFunc(cmd)

	return cmd
}

func (opts *RepoStatusOptions) Run() error {
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

	result, err := svc.StatusWithAnalyzers(ctx, opts.RepoArg)
	if err != nil {
		return err
	}

	return opts.printStatus(result)
}

func (opts *RepoStatusOptions) printStatus(result *reposvc.FullStatusResult) error {
	w := opts.stdout()
	switch opts.Output {
	case "", "pretty":
		fmt.Fprintf(w, "%-12s%s\n", "Repository", result.RepoSlug)
		if result.Activated {
			fmt.Fprintf(w, "%-12s%s\n", "Status", "Active")
			fmt.Fprintf(w, "%-12s%s\n", "Dashboard", result.DashboardURL)

			if len(result.Analyzers) > 0 {
				fmt.Fprintf(w, "\nAnalyzers (%d)\n", len(result.Analyzers))
				for _, a := range result.Analyzers {
					fmt.Fprintf(w, "  %-10s%s\n", a.Shortcode, a.Name)
				}
			}
		} else {
			fmt.Fprintf(w, "%-12s%s\n", "Status", "Not active")
		}
		return nil
	case "json":
		payload, err := json.MarshalIndent(result, "", "  ")
		if err != nil {
			return fmt.Errorf("DeepSource | Error | Failed to format JSON output: %w", err)
		}
		fmt.Fprintf(w, "%s\n", payload)
		return nil
	default:
		return fmt.Errorf("DeepSource | Error | Unsupported output format: %s", opts.Output)
	}
}

func setRepoStatusUsageFunc(cmd *cobra.Command) {
	cmd.SetUsageFunc(func(c *cobra.Command) error {
		groups := []struct {
			title string
			flags []string
		}{
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
				fmt.Fprintf(w, "  %s\n", statusFlagUsageLine(f))
			}
		}
		fmt.Fprintln(w)
		return nil
	})
}

func statusFlagUsageLine(f *pflag.Flag) string {
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
