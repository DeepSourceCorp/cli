package main

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	v "github.com/deepsourcelabs/cli/buildinfo"
	"github.com/deepsourcelabs/cli/command"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	"github.com/deepsourcelabs/cli/internal/debug"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
	"github.com/deepsourcelabs/cli/internal/update"
	"github.com/getsentry/sentry-go"
)

var (
	version   = "development"
	Date      = "YYYY-MM-DD"
	SentryDSN string
	buildMode string
)

func sentryEnvironment(ver string) string {
	if strings.HasPrefix(ver, "v") || strings.Contains(ver, ".") {
		return "production"
	}
	return "development"
}

func main() {
	os.Exit(mainRun())
}

func mainRun() (exitCode int) {
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	// Override app identity for dev builds
	if buildMode == "dev" {
		v.AppName = "deepsource-dev"
		v.ConfigDirName = ".deepsource-dev"
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
			exitCode = 2
		}
	}()

	return run()
}

func run() int {
	v.SetBuildInfo(version, Date, buildMode)

	// Two-phase auto-update: apply pending update or check for new one
	if update.ShouldAutoUpdate() {
		state, err := update.ReadUpdateState()
		if err != nil {
			debug.Log("update: %v", err)
		}

		if state != nil {
			// Phase 2: a previous run found a newer version — apply it now
			client := &http.Client{Timeout: 30 * time.Second}
			newVer, err := update.ApplyUpdate(client)
			if err != nil {
				debug.Log("update: %v", err)
			} else if newVer != "" {
				fmt.Fprintf(os.Stderr, "%s\n", style.Yellow("Updated DeepSource CLI to v%s", newVer))
			}
		} else {
			// Phase 1: check manifest and write state file for next run
			client := &http.Client{Timeout: 3 * time.Second}
			if err := update.CheckForUpdate(client); err != nil {
				debug.Log("update: %v", err)
			}
		}
	}

	exitCode := 0
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
		exitCode = 1
	}

	return exitCode
}
