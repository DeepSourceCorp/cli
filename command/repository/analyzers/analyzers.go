package analyzers

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
	"github.com/deepsourcelabs/cli/deepsource/analyzers"
	"github.com/deepsourcelabs/cli/internal/cli/args"
	"github.com/deepsourcelabs/cli/internal/cli/completion"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	reposvc "github.com/deepsourcelabs/cli/internal/services/repo"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
)

type AnalyzersOptions struct {
	RepoArg string
	Output  string
	deps    *cmddeps.Deps
}

func (opts *AnalyzersOptions) stdout() io.Writer {
	if opts.deps != nil && opts.deps.Stdout != nil {
		return opts.deps.Stdout
	}
	return os.Stdout
}

func NewCmdAnalyzers() *cobra.Command {
	return NewCmdAnalyzersWithDeps(nil)
}

func NewCmdAnalyzersWithDeps(deps *cmddeps.Deps) *cobra.Command {
	opts := AnalyzersOptions{
		deps: deps,
	}

	doc := heredoc.Docf(`
		List analyzers enabled on a repository.

		Run %[1]s to list the analyzers enabled on the current repository.

		To list analyzers for a specific repository, use the %[2]s flag:
		%[3]s
		`, style.Cyan("deepsource repo analyzers"), style.Yellow("--repo"), style.Cyan("deepsource repo analyzers --repo gh/owner/name"))

	cmd := &cobra.Command{
		Use:   "analyzers",
		Short: "List analyzers enabled on the repository",
		Long:  doc,
		Args:  args.NoArgs,
		RunE: func(_ *cobra.Command, _ []string) error {
			return opts.Run()
		},
	}

	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "List analyzers for a specific repository")
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

	setAnalyzersUsageFunc(cmd)

	return cmd
}

func (opts *AnalyzersOptions) Run() error {
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
	result, err := svc.EnabledAnalyzers(ctx, opts.RepoArg)
	if err != nil {
		return err
	}

	return opts.printAnalyzers(result)
}

func (opts *AnalyzersOptions) printAnalyzers(list []analyzers.Analyzer) error {
	w := opts.stdout()
	switch opts.Output {
	case "", "pretty":
		if len(list) == 0 {
			fmt.Fprintln(w, "No analyzers enabled on this repository.")
			return nil
		}
		data := pterm.TableData{{"Name", "Shortcode"}}
		for _, a := range list {
			data = append(data, []string{a.Name, a.Shortcode})
		}
		pterm.DefaultTable.WithHasHeader().WithData(data).Render()
		fmt.Fprintf(w, "\n%d analyzer(s) enabled\n", len(list))
		return nil
	case "json":
		payload, err := json.MarshalIndent(list, "", "  ")
		if err != nil {
			return fmt.Errorf("DeepSource | Error | Failed to format JSON output: %w", err)
		}
		fmt.Fprintf(w, "%s\n", payload)
		return nil
	default:
		return fmt.Errorf("DeepSource | Error | Unsupported output format: %s", opts.Output)
	}
}

func setAnalyzersUsageFunc(cmd *cobra.Command) {
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
				fmt.Fprintf(w, "  %s\n", analyzersFlagUsageLine(f))
			}
		}
		fmt.Fprintln(w)
		return nil
	})
}

func analyzersFlagUsageLine(f *pflag.Flag) string {
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
