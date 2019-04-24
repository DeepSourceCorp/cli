package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"strings"
)

func main() {
	// Print default stub message
	fmt.Printf("DeepSource Command Line Interface " + cliVersion + "\n \n")

	flag.Usage = func() {
		fmt.Println(commonUsageMessage)
	}

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
		os.Exit(1)
	}

	// Switch on the subcommand
	switch os.Args[1] {
	case "report":
		reportCommand.Parse(os.Args[2:])
	default:
		fmt.Println(reportUsageMessage)
		os.Exit(1)
	}

	// Get current path
	currentDir, err := os.Getwd()
	if err != nil {
		fmt.Println("DeepSource | Error | Unable to identify current directory.")
		os.Exit(0)
	}

	// Verify existence of .deepsource.toml
	_, err = os.Stat("./.deepsource.toml")
	if err != nil {
		if os.IsNotExist(err) {
			fmt.Println("DeepSource | Error | .deepsource.toml not found.")
			os.Exit(1)
		} else {
			fmt.Println("DeepSource | Error | Unable to stat .deepsource.toml")
			os.Exit(0)
		}
	}

	// Verify the env variables
	dsn := os.Getenv("DEEPSOURCE_DSN")
	if dsn == "" {
		fmt.Println("DeepSource | Error | Environment variable DEEPSOURCE_DSN not set (or) is empty. You can find it under the repository settings page.")
		os.Exit(1)
	}

	//////////////////
	// Validate DSN //
	//////////////////

	// Protocol
	dsnSplitProtocolBody := strings.Split(dsn, "://")

	// Check for valid protocol
	if strings.HasPrefix(dsnSplitProtocolBody[0], "http") == false {
		fmt.Println("DeepSource | Error | DSN specified should start with http(s). Cross verify DEEPSOURCE_DSN value against the settings page of the repository.")
		os.Exit(1)
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
		os.Exit(1)
	}

	if reportCommand.Parsed() {
		// Flag validation
		if *reportCommandValue == "" && *reportCommandValueFile == "" {
			fmt.Println("DeepSource | Error | '--value' (or) '--value-file' not passed")
			os.Exit(1)
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
				os.Exit(1)
			}

			if fileStat.Size() > 5000000 {
				fmt.Println("DeepSource | Error | Value file too large. Should be less than 5 Megabytes")
				os.Exit(1)
			}

			valueBytes, err := ioutil.ReadFile(*reportCommandValueFile)
			if err != nil {
				fmt.Println("DeepSource | Error | Unable to read specified value file: ", *reportCommandValueFile)
				os.Exit(1)
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
			os.Exit(0)
		}

		queryResponseBody, err := makeQuery(
			dsnProtocol+"://"+dsnHost+"/graphql/cli/",
			queryBodyBytes,
			"application/json",
		)
		if err != nil {
			fmt.Println("DeepSource | Error | Reporting failed | ", err)
			os.Exit(0)
		}

		// Parse query response body
		queryResponse := QueryResponse{}

		err = json.Unmarshal(queryResponseBody, &queryResponse)
		if err != nil {
			fmt.Println("DeepSource | Error | Unable to parse response body.")
			os.Exit(0)
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
			os.Exit(0)
		}

		if err != nil {
			fmt.Println("DeepSource | Error | Unable to report results.")
			os.Exit(0)
		}

		fmt.Printf("DeepSource |  Artifact published successfully \n \n")
		fmt.Printf("Analyzer  %s \n", analyzerShortcode)
		fmt.Printf("Key       %s \n", artifactKey)

		os.Exit(0)
	}
}
