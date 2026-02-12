package main

import (
	"errors"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	v "github.com/deepsourcelabs/cli/buildinfo"
	"github.com/deepsourcelabs/cli/command"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
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

func sentryEnvironment(ver string) string {
	if strings.HasPrefix(ver, "v") || strings.Contains(ver, ".") {
		return "production"
	}
	return "development"
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	// Init sentry
	err := sentry.Init(sentry.ClientOptions{
		Dsn:         SentryDSN,
		Release:     "deepsource-cli@" + version,
		Environment: sentryEnvironment(version),
	})
	if err != nil {
		log.Println("Could not load sentry.")
	}

	defer func() {
		if r := recover(); r != nil {
			sentry.CurrentHub().Recover(r)
			sentry.Flush(2 * time.Second)
			fmt.Fprintf(os.Stderr, "fatal: unexpected panic: %v\n", r)
			os.Exit(2)
		}
	}()

	v.SetBuildInfo(version, Date, "", "")

	if err := command.Execute(); err != nil {
		var cliErr *clierrors.CLIError
		if errors.As(err, &cliErr) {
			pterm.Error.Println(cliErr.Message)
			if os.Getenv("DEEPSOURCE_CLI_DEBUG") != "" && cliErr.Cause != nil {
				pterm.DefaultBasicText.Printf("  cause: %v\n", cliErr.Cause)
			}
		} else {
			pterm.Error.Println(err)
		}
		if !clierrors.IsUserError(err) {
			sentry.CaptureException(err)
		}
		sentry.Flush(2 * time.Second)
		os.Exit(1)
	}
}
