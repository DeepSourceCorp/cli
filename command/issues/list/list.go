package list

import (
	"context"
	"fmt"
	"strings"

	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/issues"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

type IssuesListOptions struct {
	FileArg     string
	RepoArg     string
	LimitArg    int
	Owner       string
	RepoName    string
	VCSProvider string
	issuesData  []issues.Issue
	ptermTable  [][]string
}

// NewCmdVersion returns the current version of cli being used
func NewCmdIssuesList() *cobra.Command {

	opts := IssuesListOptions{
		FileArg:     "",
		RepoArg:     "",
		LimitArg:    30,
		Owner:       "",
		RepoName:    "",
		VCSProvider: "",
		issuesData:  []issues.Issue{},
		ptermTable:  [][]string{},
	}

	cmd := &cobra.Command{
		Use:   "list",
		Short: "List issues reported by DeepSource",
		Args:  utils.MaxNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if len(args) == 1 {
				opts.FileArg = args[0]
			}
			err := opts.Run()
			if err != nil {
				return err
			}
			return nil
		},
	}

	// --repo, -r flag
	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "List the issues of the specified repository")

	// --limit, -l flag
	cmd.Flags().IntVarP(&opts.LimitArg, "limit", "l", 30, "Fetch the issues upto the specified limit")
	return cmd
}

// Execute the command
func (opts *IssuesListOptions) Run() error {
	var err error
	// The current limit of querying issues at once is 100. If the limit passed by user is greater than 100, exit
	// with an error message
	if opts.LimitArg > 100 {
		return fmt.Errorf("The maximum allowed limit to fetch issues is 100. Found %d", opts.LimitArg)
	}

	// Checking if the user passed --repo/-r flag or not
	if opts.RepoArg == "" {
		// If no --repo flag, parse all the remotes of the cwd through the git config
		err := opts.extractRepositoryRemotes()
		if err != nil {
			return fmt.Errorf("Error while fetching repository URL")
		}
	} else {
		// If the user has passed the --repo flag
		// Parse the repo URL (github.co/owner/reponame) in the argument passed by the user
		repoData, err := utils.RepoArgumentResolver(opts.RepoArg)
		if err != nil {
			return err
		}
		opts.VCSProvider = repoData[0]
		opts.Owner = repoData[1]
		opts.RepoName = repoData[2]
	}

	// Get the deepsource client for using the issue fetching SDK to fetch the list of issues
	deepsource := deepsource.New()
	ctx := context.Background()

	// Case 1 : Fetch issues for a certain FileArg (filepath) passed by the user
	// Example: `deepsource issues list api/hello.py`
	if opts.FileArg != "" {
		// SDK usage for fetching list of issues in a certain file passed by the user
		opts.issuesData, err = deepsource.GetIssuesForFile(ctx, opts.Owner, opts.RepoName, opts.VCSProvider, opts.FileArg, opts.LimitArg)
		if err != nil {
			return err
		}
		opts.showIssues(true)
	} else {
		// Case 2 : Fetch list of issues for the whole project
		opts.issuesData, err = deepsource.GetIssues(ctx, opts.Owner, opts.RepoName, opts.VCSProvider, opts.LimitArg)
		if err != nil {
			return err
		}
		opts.showIssues(false)
	}

	return nil
}

// Parses the SDK response and formats the data in the form of a TAB separated table
// and renders it using pterm
func (opts *IssuesListOptions) showIssues(fileMode bool) {
	var issueList []string
	opts.ptermTable = make([][]string, len(opts.issuesData))
	for index, issue := range opts.issuesData {

		filePath := issue.Location.Path
		beginLine := issue.Location.Position.BeginLine
		issueLocation := fmt.Sprintf("%s:%d", filePath, beginLine)
		analyzerShortcode := issue.Analyzer.Shortcode
		issueCode := issue.IssueCode
		issueTitle := issue.IssueText

		issueList = append(issueList, issueLocation, analyzerShortcode, issueCode, issueTitle)

		opts.ptermTable[index] = issueList
		issueList = nil
	}

	pterm.DefaultTable.WithSeparator("\t").WithData(opts.ptermTable).Render()
}

// Extracts various remotes (origin/upstream etc.) present in a certain repository's .git config file
// Helps in deciding the repo for which issues have to be listed
func (opts *IssuesListOptions) extractRepositoryRemotes() error {
	remotesData, err := utils.ListRemotes()
	if err != nil {
		if strings.Contains(err.Error(), "exit status 128") {
			fmt.Println("This repository has not been initialized with git. Please initialize it with git using `git init`")
		}
		return err
	}

	// Condition: If only 1 remote, use it
	// If more that one remote, give the user choice which one they want to choose
	if len(remotesData) == 1 {
		for _, value := range remotesData {
			opts.Owner = value[0]
			opts.RepoName = value[1]
			opts.VCSProvider = value[2]
		}
	} else {
		var promptOpts []string
		for _, value := range remotesData {
			promptOpts = append(promptOpts, value[3])
		}

		selectedRemote, err := utils.SelectFromOptions("Please select which repository you want to check?", "", promptOpts)
		if err != nil {
			return err
		}

		for _, value := range remotesData {
			if value[3] == selectedRemote {
				opts.Owner = value[0]
				opts.RepoName = value[1]
				opts.VCSProvider = value[2]
			}
		}
	}
	return nil
}
