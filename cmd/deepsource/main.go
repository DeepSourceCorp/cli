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
	"github.com/deepsourcelabs/cli/internal/cli/style"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
	"github.com/getsentry/sentry-go"
)

var (
	// Version is the build version.  This is set using ldflags -X
	version = "development"

	// Date is the build date.  This is set using ldflags -X
	Date = "YYYY-MM-DD" // YYYY-MM-DD

	// DSN used for sentry
	SentryDSN string

	// buildMode is "dev" or "prod" (default). Set via ldflags -X.
	buildMode string
)

func sentryEnvironment(ver string) string {
	if strings.HasPrefix(ver, "v") || strings.Contains(ver, ".") {
		return "production"
	}
	return "development"
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	// Override app identity for dev builds
	if buildMode == "dev" {
		v.AppName = "deepsource-dev"
		v.ConfigDirName = ".deepsource-dev"
		v.KeychainSvc = "deepsource-dev-cli"
		v.KeychainKey = "deepsource-dev-cli-token"
	}

	// Init sentry
	err := sentry.Init(sentry.ClientOptions{
		Dsn:         SentryDSN,
		Release:     v.AppName + "-cli@" + version,
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

	v.SetBuildInfo(version, Date, buildMode)

	if err := command.Execute(); err != nil {
		var cliErr *clierrors.CLIError
		if errors.As(err, &cliErr) {
			style.Errorf(os.Stderr, "%s", cliErr.Message)
		} else {
			style.Errorf(os.Stderr, "%v", err)
		}
		if !clierrors.IsUserError(err) {
			sentry.CaptureException(err)
		}
		sentry.Flush(2 * time.Second)
		os.Exit(1)
	}
}
