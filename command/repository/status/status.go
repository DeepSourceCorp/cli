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
	"github.com/deepsourcelabs/cli/internal/vcs"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
	"gopkg.in/yaml.v3"
)

type RepoStatusOptions struct {
	RepoArg        string
	TokenExpired   bool
	SelectedRemote *vcs.RemoteData
	Output         string
	deps           *cmddeps.Deps
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
		RepoArg:      "",
		TokenExpired: false,
		deps:         deps,
	}

	doc := heredoc.Docf(`
		View the activation status for the repository.

		To check if the current repository is activated on DeepSource, run:
		%[1]s

		To check if a specific repository is activated on DeepSource, use the %[2]s flag:
		%[3]s
		`, style.Cyan("deepsource repository status"), style.Yellow("--repo"), style.Cyan("deepsource repository status --repo repo_name"))

	cmd := &cobra.Command{
		Use:   "status",
		Short: "View the activation status for the repository.",
		Long:  doc,
		Args:  args.NoArgs,
		RunE: func(_ *cobra.Command, _ []string) error {
			return opts.Run()
		},
	}

	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "Get the activation status of the specified repository")
	cmd.Flags().StringVarP(&opts.Output, "output", "o", "pretty", "Output format: pretty, json, yaml")
	_ = cmd.RegisterFlagCompletionFunc("repo", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return completion.RepoCompletionCandidates(), cobra.ShellCompDirectiveNoFileComp
	})
	_ = cmd.RegisterFlagCompletionFunc("output", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return []string{
			"pretty\tPretty-printed output",
			"json\tJSON output",
			"yaml\tYAML output",
		}, cobra.ShellCompDirectiveNoFileComp
	})

	setRepoStatusUsageFunc(cmd)

	return cmd
}

func (opts *RepoStatusOptions) Run() (err error) {
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
	result, err := svc.Status(ctx, opts.RepoArg)
	if err != nil {
		return err
	}
	opts.SelectedRemote = result.Remote

	return opts.printStatus(result)
}

func (opts *RepoStatusOptions) printStatus(result *reposvc.StatusResult) error {
	w := opts.stdout()
	switch opts.Output {
	case "", "pretty":
		if result.Activated {
			pterm.Println("Analysis active on DeepSource (deepsource.com)")
		} else {
			pterm.Println("DeepSource analysis is currently not activated on this repository.")
		}
		return nil
	case "json":
		payload, err := json.MarshalIndent(result, "", "  ")
		if err != nil {
			return fmt.Errorf("DeepSource | Error | Failed to format JSON output: %w", err)
		}
		fmt.Fprintf(w, "%s\n", payload)
		return nil
	case "yaml":
		payload, err := yaml.Marshal(result)
		if err != nil {
			return fmt.Errorf("DeepSource | Error | Failed to format YAML output: %w", err)
		}
		fmt.Fprint(w, string(payload))
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
