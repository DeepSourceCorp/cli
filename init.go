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
	// Execution init
	currentDir, err := os.Getwd()
	if err != nil {
		fmt.Println("DeepSource: Error: Unable to identify current directory.")
		os.Exit(0)
	}

	fmt.Println("DeepSource: Info: Executing CLI on path " + currentDir)

	// Sub commands
	reportCommand := flag.NewFlagSet("report", flag.ExitOnError)
	reportCommandAnalyzerShortcode := reportCommand.String("analyzer", "", "Shortcode of the analyzer")
	reportCommandKey := reportCommand.String("key", "default", "Artifact key. Defaults to default.")
	reportCommandValue := reportCommand.String("value", "", "Artifact value")
	reportCommandValueFile := reportCommand.String("value-file", "", "Artifact value file. Should be a valid file path")

	// Check for subcommands
	if len(os.Args) == 1 {
		flag.Usage()
		flag.PrintDefaults()
		os.Exit(0)
	}

	// Switch on the subcommand
	switch os.Args[1] {
	case "report":
		reportCommand.Parse(os.Args[2:])
	default:
		flag.PrintDefaults()
		os.Exit(0)
	}

	// Verify existence of .deepsource.toml
	_, err = os.Stat("./.deepsource.toml")
	if err != nil {
		if os.IsNotExist(err) {
			fmt.Println("DeepSource: Error: .deepsource.toml not found.")
			os.Exit(0)
		} else {
			fmt.Println("DeepSource: Error: Unable to stat .deepsource.toml")
			os.Exit(0)
		}
	}

	// Verify the env variables
	dsn := os.Getenv("DEEPSOURCE_DSN")
	if dsn == "" {
		fmt.Println("DeepSource: Error: Environment variable DEEPSOURCE_DSN not set (or) is empty. You can find it under the repository settings page.")
		os.Exit(0)
	}

	//////////////////
	// Validate DSN //
	//////////////////

	// Protocol
	dsnSplitProtocolBody := strings.Split(dsn, "://")

	// Check for valid protocol
	if dsnSplitProtocolBody[0] != "https" {
		fmt.Printf("DeepSource: Error: DSN specified should start with https. Cross verify DEEPSOURCE_DSN value against the settings page of the repository.")
		os.Exit(0)
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
		fmt.Printf("DeepSource: Error: Unable to get commit OID HEAD")
		os.Exit(0)
	}

	if reportCommand.Parsed() {

		// Flag validation
		if *reportCommandValue == "" && *reportCommandValueFile == "" {
			fmt.Println("DeepSource: Error: Report: Value not passed")
			os.Exit(0)
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
			valueBytes, err := ioutil.ReadFile(*reportCommandValueFile)
			if err != nil {
				fmt.Println("DeepSource: Error: Report: Value file incorrect")
				os.Exit(0)
			}

			artifactValue = string(valueBytes)
		}

		////////////////////
		// Generate query //
		////////////////////

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
		}

		query.Variables.Input = queryInput

		// Marshal request body
		queryBodyBytes, err := json.Marshal(query)
		if err != nil {
			fmt.Printf("DeepSource: Error: Unable to marshal query body.")
			os.Exit(0)
		}

		_, err = makeQuery(
			dsnProtocol+"://"+dsnHost+"/graphql",
			queryBodyBytes,
			"application/json",
		)

		if err != nil {
			fmt.Printf("DeepSource: Error: Unable to report results.")
			os.Exit(0)
		}

		os.Exit(0)
	}
}
