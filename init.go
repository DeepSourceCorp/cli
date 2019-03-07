package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"strings"
)

func main() {
	// TODO: Check for path and print it
	fmt.Printf("DeepSource: Info: Executing CLI on path")

	// Sub commands
	coverageCommand := flag.NewFlagSet("coverage", flag.ExitOnError)

	// Coverage subcommand
	coverageDryRun := coverageCommand.Bool("sample-run", false, "Test run")

	// Verify that a subcommand has been provided
	// os.Arg[0] is the main command
	// os.Arg[1] will be the subcommand
	if len(os.Args) < 2 {
		fmt.Println("DeepSource: Error: Subcommand not provided.")
		flag.PrintDefaults()
		os.Exit(0)
	}

	// Switch on the subcommand
	switch os.Args[1] {
	case "coverage":
		coverageCommand.Parse(os.Args[2:])
	default:
		flag.PrintDefaults()
		os.Exit(0)
	}

	if coverageCommand.Parsed() {
		// Verify the env variables
		dsn := os.Getenv("DEEPSOURCE_DSN")
		if dsn == "" {
			fmt.Printf("DeepSource: Error: Environment variable DEEPSOURCE_DSN not set (or) is empty. You can find it under the repository settings page. \n")
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

		currentDir, err := os.Getwd()
		if err != nil {
			fmt.Printf("DeepSource: Error: Unable to identify current directory")
			os.Exit(0)
		}

		// Head Commit OID
		headCommitOID, err := gitGetHead(currentDir)
		if err != nil {
			fmt.Printf("DeepSource: Error: Unable to get commit OID HEAD")
			os.Exit(0)
		}

		// Coverage format
		// TODO: Make this enum'ish when more formats are supported
		coverageFormat := "COBETURA"

		// Coverage result
		coverageData, err := getCoverageFileContents(currentDir)
		if err != nil {
			fmt.Printf("DeepSource: Error: Unable to find coverage.xml file in the current directory")
			os.Exit(0)
		}

		////////////////////
		// Generate query //
		////////////////////

		query := Query{
			Query: queryCoverage,
		}

		coverageInput := CoverageInput{
			AccessToken: dsnAccessToken,
			CommitOID:   headCommitOID,
			Format:      coverageFormat,
			Data:        coverageData,
		}

		query.Variables.Input = coverageInput

		// Marshal request body
		queryBodyBytes, err := json.Marshal(query)
		if err != nil {
			fmt.Printf("DeepSource: Error: Unable to marshal query body.")
			os.Exit(0)
		}

		if *coverageDryRun == false {
			_, err := makeQuery(
				dsnProtocol+"://"+dsnHost+"/graphql",
				queryBodyBytes,
				"application/json",
			)

			if err != nil {
				fmt.Printf("DeepSource: Error: Unable to publish coverage results.")
				os.Exit(0)
			}
		}

		os.Exit(0)
	}
}
