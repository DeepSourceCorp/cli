package main

import (
	"fmt"
	"log"
	"os"

	"github.com/deepsourcelabs/cli/command"
	"github.com/deepsourcelabs/cli/config"
	v "github.com/deepsourcelabs/cli/version"
	"github.com/getsentry/sentry-go"
	"github.com/pterm/pterm"
)

var (
	// Version is the build version.  This is set using ldflags -X
	version = "development"

	// Date is the build date.  This is set using ldflags -X
	Date = "YYYY-MM-DD" // YYYY-MM-DD

	// DSN used for sentry
	SentryDSN string
)

func main() {

	log.SetFlags(log.LstdFlags | log.Lshortfile)

	// Init sentry
	err := sentry.Init(sentry.ClientOptions{
		Dsn: SentryDSN,
	})
	if err != nil {
		log.Println("Could not load sentry.")
	}

	// Load the config data
	err = loadConfig()
	if err != nil {
		pterm.Error.Println(err)
		os.Exit(1)
	}

	v.SetBuildInfo(version, Date, "", "")

	if err := command.Execute(); err != nil {
		// TODO: Handle exit codes here
		pterm.Error.Println(err)
		os.Exit(1)
	}
}

// Loads the config data
func loadConfig() error {
	// Initialize and load the DeepSource CLI config file
	if err := config.InitConfig(); err != nil {
		return fmt.Errorf("Error reading config file: %v", err)
	}

	// Check if token expired
	if config.Cfg.Token != "" && config.Cfg.IsExpired() {
		pterm.Info.Println("The authentication has expired. Please refresh the token using `deepsource auth refresh`")
	}
	// TODO: Automatically run `deepsource auth refresh` here
	return nil
}
