package main

import (
	"fmt"
	"log"
	"os"

	"github.com/deepsourcelabs/cli/command"
	"github.com/deepsourcelabs/cli/version"
	"github.com/getsentry/sentry-go"
	"github.com/pterm/pterm"
)

var (
	// Version is the build version.  This is set using ldflags -X
	Version = "development"

	// Date is the build date.  This is set using ldflags -X
	Date = "YYYY-MM-DD" // YYYY-MM-DD

	// DSN used for sentry
	SentryDSN string
)

func main() {

	log.SetFlags(log.LstdFlags | log.Lshortfile)

	err := sentry.Init(sentry.ClientOptions{
		Dsn: SentryDSN,
	})
	if err != nil {
		fmt.Println("Could not load sentry.")
	}

	version.SetBuildInfo(Version, Date, "", "")

	if err := command.Execute(); err != nil {
		// TODO: Handle exit codes here
		pterm.Error.Println(err)
		os.Exit(1)
	}
}
