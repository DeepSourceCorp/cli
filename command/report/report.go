package report

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/internal/cli/args"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	"github.com/deepsourcelabs/cli/internal/container"
	"github.com/deepsourcelabs/cli/internal/interfaces"
	reportsvc "github.com/deepsourcelabs/cli/internal/services/report"
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
)

type ReportOptions struct {
	Analyzer                    string
	AnalyzerType                string
	Key                         string
	Value                       string
	ValueFile                   string
	SkipCertificateVerification bool
	DSN                         string
	UseOIDC                     bool
	OIDCRequestToken            string // id token to manually get an OIDC token
	OIDCRequestUrl              string // url to manually get an OIDC token
	DeepSourceHostEndpoint      string // DeepSource host endpoint where the app is running. Defaults to the cloud endpoint https://app.deepsource.com
	OIDCProvider                string // OIDC provider to use for authentication
	Output                      string // Output format: pretty, json
}

// NewCmdReport returns the command to report artifacts to DeepSource
func NewCmdReport() *cobra.Command {
	return NewCmdReportWithDeps(nil)
}

// NewCmdReportWithDeps builds the report command with injected dependencies.
// When deps is nil, it will be created at execution time to respect flags/env.
func NewCmdReportWithDeps(deps *container.Container) *cobra.Command {
	opts := ReportOptions{}

	doc := heredoc.Docf(`
		Report artifacts to DeepSource.

		Use %[1]s to specify the analyzer shortcode and %[2]s to identify the language:
		  %[3]s

		Provide the artifact value inline or from a file:
		  %[4]s
		  %[5]s
		`,
		style.Yellow("--analyzer"),
		style.Yellow("--key"),
		style.Cyan("deepsource report --analyzer test-coverage --key python --value-file coverage.xml"),
		style.Cyan("deepsource report --analyzer test-coverage --key go --value '<coverage_data>'"),
		style.Cyan("deepsource report --analyzer test-coverage --key go --value-file coverage.out"),
	)

	cmd := &cobra.Command{
		Use:   "report",
		Short: "Report artifacts to DeepSource",
		Long:  doc,
		Args:  args.NoArgs,
		RunE: func(cmd *cobra.Command, _ []string) error {
			if deps == nil {
				deps = container.New()
			}
			svc := reportsvc.NewService(reportsvc.ServiceDeps{
				GitClient:   deps.GitClient,
				HTTPClient:  deps.HTTPClient,
				FileSystem:  deps.FileSystem,
				Environment: deps.Environment,
				Sentry:      deps.Sentry,
				Output:      deps.Output,
				Workdir:     os.Getwd,
			})

			return opts.Run(cmd.Context(), svc, deps.Output)
		},
	}

	// --analyzer flag
	cmd.Flags().StringVar(&opts.Analyzer, "analyzer", "", "name of the analyzer to report the artifact to (example: test-coverage)")

	cmd.Flags().StringVar(&opts.AnalyzerType, "analyzer-type", "", "type of the analyzer (example: community)")

	cmd.Flags().StringVar(&opts.Key, "key", "", "shortcode of the language (example: go)")

	cmd.Flags().StringVar(&opts.Value, "value", "", "value of the artifact")

	cmd.Flags().StringVar(&opts.ValueFile, "value-file", "", "path to the artifact value file")

	cmd.Flags().BoolVar(&opts.UseOIDC, "use-oidc", false, "use OIDC to authenticate with DeepSource")

	cmd.Flags().StringVar(&opts.OIDCRequestToken, "oidc-request-token", "", "request ID token to fetch an OIDC token from OIDC provider")

	cmd.Flags().StringVar(&opts.OIDCRequestUrl, "oidc-request-url", "", "OIDC provider's request URL to fetch an OIDC token")
	cmd.Flags().StringVar(&opts.DeepSourceHostEndpoint, "deepsource-host-endpoint", "https://app.deepsource.com", "DeepSource host endpoint where the app is running. Defaults to the cloud endpoint https://app.deepsource.com")
	cmd.Flags().StringVar(&opts.OIDCProvider, "oidc-provider", "", "OIDC provider to use for authentication. Supported providers: github-actions")
	cmd.Flags().StringVar(&opts.Output, "output", "pretty", "Output format: pretty, json")

	// --skip-verify flag to skip SSL certificate verification while reporting test coverage data.
	cmd.Flags().BoolVar(&opts.SkipCertificateVerification, "skip-verify", false, "skip SSL certificate verification while sending the test coverage data")

	_ = cmd.RegisterFlagCompletionFunc("analyzer", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return []string{
			"test-coverage\tReport test coverage data",
		}, cobra.ShellCompDirectiveNoFileComp
	})
	_ = cmd.RegisterFlagCompletionFunc("key", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return []string{
			"python", "go", "javascript", "ruby", "java", "scala", "php", "csharp", "cxx", "rust", "swift", "kotlin",
		}, cobra.ShellCompDirectiveNoFileComp
	})
	_ = cmd.RegisterFlagCompletionFunc("output", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return []string{
			"pretty\tPretty-printed output",
			"json\tJSON output",
		}, cobra.ShellCompDirectiveNoFileComp
	})
	_ = cmd.RegisterFlagCompletionFunc("analyzer-type", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return []string{
			"community\tCommunity analyzer",
		}, cobra.ShellCompDirectiveNoFileComp
	})
	_ = cmd.RegisterFlagCompletionFunc("oidc-provider", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return []string{
			"github-actions\tGitHub Actions OIDC",
		}, cobra.ShellCompDirectiveNoFileComp
	})

	setReportUsageFunc(cmd)
	return cmd
}

func (opts *ReportOptions) Run(ctx context.Context, svc *reportsvc.Service, output interfaces.OutputWriter) error {
	result, err := svc.Report(ctx, reportsvc.Options{
		Analyzer:                    opts.Analyzer,
		AnalyzerType:                opts.AnalyzerType,
		Key:                         opts.Key,
		Value:                       opts.Value,
		ValueFile:                   opts.ValueFile,
		SkipCertificateVerification: opts.SkipCertificateVerification,
		DSN:                         opts.DSN,
		UseOIDC:                     opts.UseOIDC,
		OIDCRequestToken:            opts.OIDCRequestToken,
		OIDCRequestUrl:              opts.OIDCRequestUrl,
		DeepSourceHostEndpoint:      opts.DeepSourceHostEndpoint,
		OIDCProvider:                opts.OIDCProvider,
	})
	if err != nil {
		return err
	}

	if err := printReportResult(output, opts.Output, result); err != nil {
		return err
	}

	return nil
}

func setReportUsageFunc(cmd *cobra.Command) {
	cmd.SetUsageFunc(func(c *cobra.Command) error {
		groups := []struct {
			title string
			flags []string
		}{
			{"Artifact", []string{"analyzer", "analyzer-type", "key", "value", "value-file"}},
			{"Authentication", []string{"use-oidc", "oidc-provider", "oidc-request-token", "oidc-request-url", "deepsource-host-endpoint"}},
			{"Output", []string{"output"}},
			{"General", []string{"skip-verify", "help"}},
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
				fmt.Fprintf(w, "  %s\n", flagUsageLine(f))
			}
		}
		fmt.Fprintln(w)
		return nil
	})
}

func flagUsageLine(f *pflag.Flag) string {
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

func printReportResult(output interfaces.OutputWriter, format string, result *reportsvc.Result) error {
	write := func(format string, args ...interface{}) {
		if output == nil {
			fmt.Printf(format, args...)
			return
		}
		output.Printf(format, args...)
	}

	switch format {
	case "", "pretty":
		write("Artifact published successfully\n")
		write("Analyzer  %s\n", result.Analyzer)
		write("Key       %s\n", result.Key)
		if result.Message != "" {
			write("Message   %s\n", result.Message)
		}
		if result.Warning != "" {
			write("%s", result.Warning)
		}
		return nil
	case "json":
		payload, err := json.MarshalIndent(result, "", "  ")
		if err != nil {
			return fmt.Errorf("Failed to format JSON output: %w", err)
		}
		write("%s\n", payload)
		return nil
	default:
		return fmt.Errorf("Unsupported output format: %s", format)
	}
}
