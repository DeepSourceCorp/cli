package analyzers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"

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
	"gopkg.in/yaml.v3"
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
		`, style.Cyan("deepsource repository analyzers"), style.Yellow("--repo"), style.Cyan("deepsource repository analyzers --repo owner/repo"))

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
	cmd.Flags().StringVar(&opts.Output, "output", "pretty", "Output format: pretty, table, json, yaml")
	_ = cmd.RegisterFlagCompletionFunc("repo", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return completion.RepoCompletionCandidates(), cobra.ShellCompDirectiveNoFileComp
	})
	_ = cmd.RegisterFlagCompletionFunc("output", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return []string{
			"pretty\tPretty-printed output",
			"table\tHuman-readable table",
			"json\tJSON output",
			"yaml\tYAML output",
		}, cobra.ShellCompDirectiveNoFileComp
	})

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
	case "", "pretty", "table":
		if len(list) == 0 {
			pterm.Println("No analyzers enabled on this repository.")
			return nil
		}
		data := pterm.TableData{{"Name", "Shortcode"}}
		for _, a := range list {
			data = append(data, []string{a.Name, a.Shortcode})
		}
		pterm.DefaultTable.WithHasHeader().WithData(data).Render()
		pterm.Printf("\n%d analyzer(s) enabled\n", len(list))
		return nil
	case "json":
		payload, err := json.MarshalIndent(list, "", "  ")
		if err != nil {
			return fmt.Errorf("DeepSource | Error | Failed to format JSON output: %w", err)
		}
		fmt.Fprintf(w, "%s\n", payload)
		return nil
	case "yaml":
		payload, err := yaml.Marshal(list)
		if err != nil {
			return fmt.Errorf("DeepSource | Error | Failed to format YAML output: %w", err)
		}
		fmt.Fprint(w, string(payload))
		return nil
	default:
		return fmt.Errorf("DeepSource | Error | Unsupported output format: %s", opts.Output)
	}
}
