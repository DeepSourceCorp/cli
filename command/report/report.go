package report

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"strings"

	"github.com/deepsourcelabs/cli/cmdutils"
	"github.com/getsentry/sentry-go"
	"github.com/spf13/cobra"
)

type ReportOptions struct {
	Analyzer  string
	Key       string
	Value     string
	ValueFile string
}

// NewCmdVersion returns the current version of cli being used
func NewCmdReport() *cobra.Command {
	opts := ReportOptions{}

	cmd := &cobra.Command{
		Use:   "report",
		Short: "Report artifacts to DeepSource",
		Args:  cmdutils.NoArgs,
		Run: func(cmd *cobra.Command, args []string) {
			returnCode := opts.Run()
			defer os.Exit(returnCode)
		},
	}

	// --repo, -r flag
	cmd.Flags().StringVar(&opts.Analyzer, "analyzer", "", "The analyzer shortcode whose test coverage is being reported")

	cmd.Flags().StringVar(&opts.Key, "key", "", "The artifact being reported.tcv for test-coverage")

	cmd.Flags().StringVar(&opts.ValueFile, "value-file", "", "Path to the value file")

	cmd.Flags().StringVar(&opts.ValueFile, "value", "", "Value of the artifact")

	return cmd
}

func (opts *ReportOptions) Run() int {

	// Verify the env variables
	dsn := os.Getenv("DEEPSOURCE_DSN")
	if dsn == "" {
		fmt.Println("DeepSource | Error | Environment variable DEEPSOURCE_DSN not set (or) is empty. You can find it under the repository settings page.")
		return 1
	}
	sentry.ConfigureScope(func(scope *sentry.Scope) {
		scope.SetUser(sentry.User{ID: dsn})
	})

	/////////////////////
	// Command: report //
	/////////////////////

	reportCommandAnalyzerShortcode := opts.Analyzer
	reportCommandKey := opts.Key
	reportCommandValue := opts.Value
	reportCommandValueFile := opts.ValueFile

	// Get current path
	currentDir, err := os.Getwd()
	if err != nil {
		fmt.Println("DeepSource | Error | Unable to identify current directory.")
		sentry.CaptureException(err)
		return 0
	}
	sentry.ConfigureScope(func(scope *sentry.Scope) {
		scope.SetExtra("currentDir", currentDir)
	})

	//////////////////
	// Validate DSN //
	//////////////////

	// Protocol
	dsnSplitProtocolBody := strings.Split(dsn, "://")

	// Check for valid protocol
	if strings.HasPrefix(dsnSplitProtocolBody[0], "http") == false {
		err = errors.New("DeepSource | Error | DSN specified should start with http(s). Cross verify DEEPSOURCE_DSN value against the settings page of the repository.")
		fmt.Println(err)
		sentry.CaptureException(err)
		return 1
	}
	dsnProtocol := dsnSplitProtocolBody[0]

	// Parse body of the DSN
	dsnSplitTokenHost := strings.Split(dsnSplitProtocolBody[1], "@")

	// Set values parsed from DSN
	dsnHost := dsnSplitTokenHost[1]

	///////////////////////
	// Generate metadata //
	///////////////////////

	// Access token
	dsnAccessToken := dsnSplitTokenHost[0]

	// Head Commit OID
	headCommitOID, err := gitGetHead(currentDir)
	if err != nil {
		fmt.Println("DeepSource | Error | Unable to get commit OID HEAD. Make sure you are running the CLI from a git repository")
		sentry.CaptureException(err)
		return 1
	}
	sentry.ConfigureScope(func(scope *sentry.Scope) {
		scope.SetExtra("headCommitOID", headCommitOID)
	})

	// Flag validation
	if reportCommandValue == "" && reportCommandValueFile == "" {
		fmt.Println("DeepSource | Error | '--value' (or) '--value-file' not passed")
		return 1
	}

	var analyzerShortcode string
	var artifactKey string
	var artifactValue string

	analyzerShortcode = reportCommandAnalyzerShortcode
	artifactKey = reportCommandKey

	if reportCommandValue != "" {
		artifactValue = reportCommandValue
	}

	if reportCommandValueFile != "" {
		// Check file size
		fileStat, err := os.Stat(reportCommandValueFile)
		if err != nil {
			fmt.Println("DeepSource | Error | Unable to read specified value file: " + reportCommandValueFile)
			sentry.CaptureException(err)
			return 1
		}

		if fileStat.Size() > 5000000 {
			fmt.Println("DeepSource | Error | Value file too large. Should be less than 5 Megabytes")
			return 1
		}

		valueBytes, err := ioutil.ReadFile(reportCommandValueFile)
		if err != nil {
			fmt.Println("DeepSource | Error | Unable to read specified value file: ", reportCommandValueFile)
			sentry.CaptureException(err)
			return 1
		}

		artifactValue = string(valueBytes)
	}

	////////////////////
	// Generate query //
	////////////////////

	reportMeta := make(map[string]string)
	reportMeta["workDir"] = currentDir

	query := ReportQuery{
		Query: reportGraphqlQuery,
	}

	queryInput := ReportQueryInput{
		AccessToken:       dsnAccessToken,
		CommitOID:         headCommitOID,
		ReporterName:      "cli",
		ReporterVersion:   cliVersion,
		Key:               artifactKey,
		Data:              artifactValue,
		AnalyzerShortcode: analyzerShortcode,
		Metadata:          reportMeta,
	}

	query.Variables.Input = queryInput

	// Marshal request body
	queryBodyBytes, err := json.Marshal(query)
	if err != nil {
		fmt.Println("DeepSource | Error | Unable to marshal query body.")
		sentry.CaptureException(err)
		return 0
	}

	queryResponseBody, err := makeQuery(
		dsnProtocol+"://"+dsnHost+"/graphql/cli/",
		queryBodyBytes,
		"application/json",
	)
	if err != nil {
		fmt.Println("DeepSource | Error | Reporting failed | ", err)
		sentry.CaptureException(err)
		return 0
	}

	// Parse query response body
	queryResponse := QueryResponse{}

	err = json.Unmarshal(queryResponseBody, &queryResponse)
	if err != nil {
		fmt.Println("DeepSource | Error | Unable to parse response body.")
		sentry.CaptureException(err)
		return 0
	}

	// Check for errors in response body
	// Response format:
	// {
	//   "data": {
	//     "createArtifact": {
	//       "ok": false,
	//       "error": "No repository found attached with the access token: dasdsds"
	//     }
	//   }
	// }

	if queryResponse.Data.CreateArtifact.Ok != true {
		fmt.Println("DeepSource | Error | Reporting failed | ", queryResponse.Data.CreateArtifact.Error)
		sentry.CaptureException(errors.New(queryResponse.Data.CreateArtifact.Error))
		return 0
	}

	if err != nil {
		fmt.Println("DeepSource | Error | Unable to report results.")
		sentry.CaptureException(err)
		return 0
	}

	fmt.Printf("DeepSource |  Artifact published successfully \n \n")
	fmt.Printf("Analyzer  %s \n", analyzerShortcode)
	fmt.Printf("Key       %s \n", artifactKey)

	return 0

}
