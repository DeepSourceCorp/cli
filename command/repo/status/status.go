package status

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/internal/cli/args"
	"github.com/deepsourcelabs/cli/internal/cli/completion"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	reposvc "github.com/deepsourcelabs/cli/internal/services/repo"
	"github.com/deepsourcelabs/cli/internal/vcs"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
	"gopkg.in/yaml.v3"
)

type RepoStatusOptions struct {
	RepoArg        string
	TokenExpired   bool
	SelectedRemote *vcs.RemoteData
	Output         string
}

// NewCmdRepoStatus handles querying the activation status of the repo supplied as an arg
func NewCmdRepoStatus() *cobra.Command {
	opts := RepoStatusOptions{
		RepoArg:      "",
		TokenExpired: false,
	}

	doc := heredoc.Docf(`
		View the activation status for the repository.

		To check if the current repository is activated on DeepSource, run:
		%[1]s

		To check if a specific repository is activated on DeepSource, use the %[2]s flag:
		%[3]s
		`, style.Cyan("deepsource repo status"), style.Yellow("--repo"), style.Cyan("deepsource repo status --repo repo_name"))

	cmd := &cobra.Command{
		Use:   "status",
		Short: "View the activation status for the repository.",
		Long:  doc,
		Args:  args.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			return opts.Run()
		},
	}

	// --repo, -r flag
	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "Get the activation status of the specified repository")
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

func (opts *RepoStatusOptions) Run() (err error) {
	ctx := context.Background()
	svc := reposvc.NewService(config.DefaultManager())
	result, err := svc.Status(ctx, opts.RepoArg)
	if err != nil {
		return err
	}
	opts.SelectedRemote = result.Remote

	return printStatus(opts.Output, result)
}

func printStatus(format string, result *reposvc.StatusResult) error {
	switch format {
	case "", "table":
		if result.Activated {
			pterm.Println("Analysis active on DeepSource (deepsource.io)")
		} else {
			pterm.Println("DeepSource analysis is currently not activated on this repository.")
		}
		return nil
	case "json":
		payload, err := json.MarshalIndent(result, "", "  ")
		if err != nil {
			return fmt.Errorf("DeepSource | Error | Failed to format JSON output: %w", err)
		}
		fmt.Printf("%s\n", payload)
		return nil
	case "yaml":
		payload, err := yaml.Marshal(result)
		if err != nil {
			return fmt.Errorf("DeepSource | Error | Failed to format YAML output: %w", err)
		}
		fmt.Print(string(payload))
		return nil
	default:
		return fmt.Errorf("DeepSource | Error | Unsupported output format: %s", format)
	}
}
