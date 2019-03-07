package main

import (
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
	coveragePush := coverageCommand.Bool("push", true, "Push")
	coverageDryRun := coverageCommand.Bool("sample-run", false, "Test run")

	switch os.Args[1] {
	case "coverage":
		coverageCommand.Parse(os.Args[2:])
	default:
		flag.PrintDefaults()
		os.Exit(1)
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

	}
}
