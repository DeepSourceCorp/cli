package main

import (
	"log"
	"net/http"
	"os"
	"time"

	_ "net/http/pprof"

	"github.com/deepsourcelabs/cli/command"
	v "github.com/deepsourcelabs/cli/version"
	"github.com/getsentry/sentry-go"
	"github.com/pkg/profile"
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

	defer profile.Start(profile.MemProfile).Stop()

	go func() {
		http.ListenAndServe(":8080", nil)
	}()

	//...
	// Init sentry
	err := sentry.Init(sentry.ClientOptions{
		Dsn: SentryDSN,
	})
	if err != nil {
		log.Println("Could not load sentry.")
	}
	v.SetBuildInfo(version, Date, "", "")

	if err := command.Execute(); err != nil {
		// TODO: Handle exit codes here
		pterm.Error.Println(err)
		sentry.CaptureException(err)
		sentry.Flush(2 * time.Second)
		os.Exit(1)
	}
}
