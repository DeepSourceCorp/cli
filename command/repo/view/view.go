package view

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/MakeNowJust/heredoc"
	"github.com/cli/browser"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/internal/cli/args"
	"github.com/deepsourcelabs/cli/internal/cli/completion"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	reposvc "github.com/deepsourcelabs/cli/internal/services/repo"
	"github.com/deepsourcelabs/cli/internal/vcs"
	"github.com/spf13/cobra"
	"gopkg.in/yaml.v3"
)

type RepoViewOptions struct {
	RepoArg        string
	TokenExpired   bool
	SelectedRemote *vcs.RemoteData
	Output         string
}

func NewCmdRepoView() *cobra.Command {
	opts := RepoViewOptions{
		RepoArg:        "",
		SelectedRemote: &vcs.RemoteData{},
	}

	doc := heredoc.Docf(`
		Open the DeepSource dashboard of a repository.

		Run %[1]s to open the DeepSource dashboard inside the browser.
		`, style.Cyan("deepsource repo view"))

	cmd := &cobra.Command{
		Use:   "view",
		Short: "Open the DeepSource dashboard of a repository",
		Long:  doc,
		Args:  args.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			return opts.Run()
		},
	}

	// --repo, -r flag
	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "Open the DeepSource dashboard of the specified repository")
	cmd.Flags().StringVar(&opts.Output, "output", "table", "Output format: table, json, yaml")
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
	return cmd
}

func (opts *RepoViewOptions) Run() (err error) {
	ctx := context.Background()
	svc := reposvc.NewService(config.DefaultManager())
	dashboardURL, err := svc.ViewURL(ctx, opts.RepoArg)
	if err != nil {
		return err
	}

	return printView(opts.Output, dashboardURL)
}

func printView(format string, dashboardURL string) error {
	switch format {
	case "", "table":
		fmt.Printf("Press Enter to open %s in your browser...", dashboardURL)
		fmt.Scanln()
		return browser.OpenURL(dashboardURL)
	case "json":
		payload, err := json.MarshalIndent(map[string]string{"url": dashboardURL}, "", "  ")
		if err != nil {
			return fmt.Errorf("DeepSource | Error | Failed to format JSON output: %w", err)
		}
		fmt.Printf("%s\n", payload)
		return nil
	case "yaml":
		payload, err := yaml.Marshal(map[string]string{"url": dashboardURL})
		if err != nil {
			return fmt.Errorf("DeepSource | Error | Failed to format YAML output: %w", err)
		}
		fmt.Print(string(payload))
		return nil
	default:
		return fmt.Errorf("DeepSource | Error | Unsupported output format: %s", format)
	}
}
