package main

import (
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"strings"
	"time"

	"github.com/getsentry/sentry-go"
)

var SentryDSN string

func run() int {
	// Print default stub message
	fmt.Printf("DeepSource Command Line Interface " + cliVersion + "\n \n")

	err := sentry.Init(sentry.ClientOptions{
		Dsn: SentryDSN,
	})
	if err != nil {
		fmt.Println("Could not load sentry.")
	}

	flag.Usage = func() {
		fmt.Println(commonUsageMessage)
	}

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

	reportCommand := flag.NewFlagSet("report", flag.ExitOnError)
	reportCommandAnalyzerShortcode := reportCommand.String("analyzer", "", "")
	reportCommandKey := reportCommand.String("key", "default", "")
	reportCommandValue := reportCommand.String("value", "", "")
	reportCommandValueFile := reportCommand.String("value-file", "", "")

	reportCommand.Usage = func() {
		fmt.Println(reportUsageMessage)
	}

	// Parse flags to extract its values
	flag.Parse()

	// Check for subcommands
	if len(os.Args) == 1 {
		fmt.Println(commonUsageMessage)
		return 1
	}

	// Switch on the subcommand
	switch os.Args[1] {
	case "report":
		reportCommand.Parse(os.Args[2:])
	default:
		fmt.Println(reportUsageMessage)
		return 1
	}
	sentry.ConfigureScope(func(scope *sentry.Scope) {
		scope.SetExtra("Args", os.Args)
	})

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

	if reportCommand.Parsed() {
		// Flag validation
		if *reportCommandValue == "" && *reportCommandValueFile == "" {
			fmt.Println("DeepSource | Error | '--value' (or) '--value-file' not passed")
			return 1
		}

		var analyzerShortcode string
		var artifactKey string
		var artifactValue string

		analyzerShortcode = *reportCommandAnalyzerShortcode
		artifactKey = *reportCommandKey

		if *reportCommandValue != "" {
			artifactValue = *reportCommandValue
		}

		if *reportCommandValueFile != "" {
			// Check file size
			fileStat, err := os.Stat(*reportCommandValueFile)
			if err != nil {
				fmt.Println("DeepSource | Error | Unable to read specified value file: " + *reportCommandValueFile)
				sentry.CaptureException(err)
				return 1
			}

			if fileStat.Size() > 5000000 {
				fmt.Println("DeepSource | Error | Value file too large. Should be less than 5 Megabytes")
				return 1
			}

			valueBytes, err := ioutil.ReadFile(*reportCommandValueFile)
			if err != nil {
				fmt.Println("DeepSource | Error | Unable to read specified value file: ", *reportCommandValueFile)
				sentry.CaptureException(err)
				return 1
			}

			artifactValue = string(valueBytes)
		}

		////////////////////
		// Generate query //
		////////////////////

		reportMeta := Metadata{
			WorkDir: currentDir,
		}

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
	return 0
}

func main() {
	returnCode := run()
	defer os.Exit(returnCode)
	defer sentry.Flush(2 * time.Second)
}
