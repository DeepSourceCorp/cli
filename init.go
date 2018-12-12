package main

import (
	"flag"
	"fmt"
	"os"
)

func main() {
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
			fmt.Printf("Environment variable DEEPSOURCE_DSN not set (or) is empty. \n")
		}

		// Verify if .deepsource.toml exists
		_, err := os.Stat("./.deepsource.toml")
		if err != nil {
			if os.IsNotExist(err) {
				fmt.Printf("Environment variable DEEPSOURCE_DSN not set (or) is empty. \n")
			} else {
				// other error
			}
		}
	}

}
