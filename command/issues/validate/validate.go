package validate

import (
	"context"
	"fmt"
	"regexp"

	issue_utils "github.com/deepsourcelabs/cli/command/issues/utils"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/issues"
	ds_utils "github.com/deepsourcelabs/cli/utils"
	"github.com/deepsourcelabs/marvin-secrets/validate"
	"github.com/deepsourcelabs/marvin-secrets/validate/common"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

type ValidateOptions struct {
	FileArg        []string
	RepoArg        string
	AnalyzerArg    []string
	SelectedRemote *ds_utils.RemoteData
	issuesData     []issues.Issue
}

func NewCmdValidateSecrets() *cobra.Command {
	opts := ValidateOptions{
		FileArg:     []string{""},
		RepoArg:     "",
		AnalyzerArg: []string{"secrets"},
	}

	cmd := &cobra.Command{
		Use:   "validate",
		Short: "Validate secrets issues reported by DeepSource",
		Long:  "Validate secrets issues reported by DeepSource",
		RunE: func(cmd *cobra.Command, args []string) error {
			opts.FileArg = args
			return opts.Run()
		},
	}

	return cmd
}

const secretRegex string = `Leaked ".*" detected in source: "(.*)"`

// Execute the command
func (opts *ValidateOptions) Run() (err error) {
	// Fetch config
	cfg, err := config.GetConfig()
	if err != nil {
		return fmt.Errorf("Error while reading DeepSource CLI config : %v", err)
	}
	err = cfg.VerifyAuthentication()
	if err != nil {
		return err
	}

	// Get the remote repository URL for which issues have to be listed
	opts.SelectedRemote, err = ds_utils.ResolveRemote(opts.RepoArg)
	if err != nil {
		return err
	}

	// Fetch the list of issues using SDK (deepsource package) based on user input
	ctx := context.Background()
	err = opts.getIssuesData(ctx)
	if err != nil {
		return err
	}

	secretMatcher := regexp.MustCompile(secretRegex)

	table := make([][]string, 0, len(opts.issuesData))
	for _, issue := range opts.issuesData {
		validator := validate.GetValidator(issue.IssueCode)
		matches := secretMatcher.FindStringSubmatch(issue.IssueText)
		if len(matches) < 2 {
			continue
		}
		validity, err := validator.Validate(matches[1])
		if err != nil {
			fmt.Println(err)
			continue
		}
		var validityString string
		switch validity {
		case common.Valid:
			validityString = "VALID"
		case common.Invalid:
			validityString = "INVALID"
		case common.Expired:
			validityString = "EXPIRED"
		case common.Unknown:
			validityString = "UNKNOWN"
		}

		issueLocation := fmt.Sprintf("%s:%d", issue.Location.Path, issue.Location.Position.BeginLine)
		table = append(table, []string{issueLocation, issue.IssueCode, issue.IssueTitle, validityString})
	}

	pterm.DefaultTable.WithSeparator("\t").WithData(table).Render()

	return nil
}

// Gets the data about issues using the SDK based on the user input
// i.e for a single file or for the whole project
func (opts *ValidateOptions) getIssuesData(ctx context.Context) (err error) {
	// Get the deepsource client for using the issue fetching SDK to fetch the list of issues
	deepsource, err := deepsource.New(deepsource.ClientOpts{
		Token:    config.Cfg.Token,
		HostName: config.Cfg.Host,
	})
	if err != nil {
		return err
	}

	// Fetch list of issues for the whole project
	opts.issuesData, err = deepsource.GetIssues(ctx, opts.SelectedRemote.Owner, opts.SelectedRemote.RepoName, opts.SelectedRemote.VCSProvider, 100)
	if err != nil {
		return err
	}

	var filteredIssues []issues.Issue

	if len(opts.AnalyzerArg) != 0 {
		var fetchedIssues []issues.Issue

		// Filter issues based on the analyzer shortcode
		filteredIssues, err = issue_utils.FilterIssuesByAnalyzer(opts.AnalyzerArg, opts.issuesData)
		if err != nil {
			return err
		}
		fetchedIssues = append(fetchedIssues, filteredIssues...)

		// set fetched issues as issue data
		opts.issuesData = issue_utils.GetUniqueIssues(fetchedIssues)
	}

	// Fetch issues for a certain FileArg (filepath) passed by the user
	// Example: `deepsource issues list api/hello.py`
	if len(opts.FileArg) != 0 {
		var fetchedIssues []issues.Issue
		for _, arg := range opts.FileArg {
			// Filter issues for the valid directories/files
			filteredIssues, err = issue_utils.FilterIssuesByPath(arg, opts.issuesData)
			if err != nil {
				return err
			}
			fetchedIssues = append(fetchedIssues, filteredIssues...)
		}

		// set fetched issues as issue data
		opts.issuesData = issue_utils.GetUniqueIssues(fetchedIssues)
	}

	return nil
}
