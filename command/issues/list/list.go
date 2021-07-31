package list

import (
	"context"
	"fmt"
	"log"
	"strings"

	"github.com/deepsourcelabs/cli/cmdutils"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/issues"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

type IssuesListOptions struct {
	FileArg  string
	RepoArg  string
	LimitArg int

	Owner       string
	RepoName    string
	VCSProvider string

	issuesData        *issues.IssuesListResponseData
	issuesDataForFile *issues.IssuesListFileResponseData
	ptermTable        [][]string
}

// NewCmdVersion returns the current version of cli being used
func NewCmdIssuesList(cf *cmdutils.CLIFactory) *cobra.Command {

	opts := IssuesListOptions{
		FileArg:     "",
		RepoArg:     "",
		LimitArg:    30,
		Owner:       "",
		RepoName:    "",
		VCSProvider: "",
		ptermTable:  [][]string{},
	}

	cmd := &cobra.Command{
		Use:   "list",
		Short: "List issues reported by DeepSource",
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
		SilenceErrors: true,
		SilenceUsage:  true,
	}

	// --repo, -r flag
	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "List the issues of the specified repository")

	// --limit, -l flag
	cmd.Flags().IntVarP(&opts.LimitArg, "limit", "l", 30, "Fetch the issues upto the specified limit")
	return cmd
}

func (opts *IssuesListOptions) Run() error {

	// We need to specify the repository url by ourselves
	if opts.LimitArg > 100 {
		return fmt.Errorf("The maximum allowed limit to fetch issues is 100. Found %d", opts.LimitArg)
	}

	if opts.RepoArg == "" {

		remotesData, err := cmdutils.ListRemotes()
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

			selectedRemote, err := cmdutils.SelectFromOptions("Please select which repository you want to check?", "", promptOpts)
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
	} else {

		// If the user has passed the --repo flag

		// Parsing the arguments to --repo flag
		repoData, err := cmdutils.RepoArgumentResolver(opts.RepoArg)
		if err != nil {
			return err
		}

		opts.VCSProvider = repoData[0]
		opts.Owner = repoData[1]
		opts.RepoName = repoData[2]
	}

	var err error

	deepsource := deepsource.New()
	ctx := context.Background()
	// Case 1 : For a certain FileArg (filepath)
	if opts.FileArg != "" {
		// opts.issuesDataForFile, err = api.GetIssuesForFile(opts.graphqlClient, opts.Owner, opts.RepoName, opts.VCSProvider, opts.FileArg)

		opts.issuesDataForFile, err = deepsource.GetIssuesForFile(ctx, opts.Owner, opts.RepoName, opts.VCSProvider, opts.RepoArg, opts.LimitArg)
		if err != nil {
			return err
		}

		opts.ShowIssues(true)

	} else {
		// Case 2 : For the whole project
		opts.issuesData, err = deepsource.GetIssues(ctx, opts.Owner, opts.RepoName, opts.VCSProvider, opts.LimitArg)
		if err != nil {
			return err
		}

		opts.ShowIssues(false)
	}

	return nil
}

func (opts *IssuesListOptions) ShowIssues(fileMode bool) {

	var nodeData []string

	if fileMode == true {

		opts.ptermTable = make([][]string, len(opts.issuesDataForFile.Repository.File.Issues.Edges))

		for index, edge := range opts.issuesDataForFile.Repository.File.Issues.Edges {

			filePath := edge.Node.Path
			beginLine := edge.Node.Beginline
			issueLocation := fmt.Sprintf("%s:%d", filePath, beginLine)
			analyzerShortcode := edge.Node.Concreteissue.Analyzer.Shortcode
			issueCode := edge.Node.Concreteissue.Shortcode
			issueTitle := edge.Node.Concreteissue.Title

			nodeData = append(nodeData, issueLocation, analyzerShortcode, issueCode, issueTitle)
			log.Println(nodeData)

			opts.ptermTable[index] = nodeData

			nodeData = nil
		}
	} else {

		opts.ptermTable = make([][]string, len(opts.issuesData.Repository.Issues.Edges))
		for index, edge := range opts.issuesData.Repository.Issues.Edges {

			filePath := edge.Node.Path
			beginLine := edge.Node.Beginline
			issueLocation := fmt.Sprintf("%s:%d", filePath, beginLine)
			analyzerShortcode := edge.Node.Concreteissue.Analyzer.Shortcode
			issueCode := edge.Node.Concreteissue.Shortcode
			issueTitle := edge.Node.Concreteissue.Title

			nodeData = append(nodeData, issueLocation, analyzerShortcode, issueCode, issueTitle)

			opts.ptermTable[index] = nodeData

			nodeData = nil
		}
	}

	pterm.DefaultTable.WithSeparator("\t").WithData(opts.ptermTable).Render()

}
