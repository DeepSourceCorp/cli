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

type updateResult struct {
	version string
	err     error
}

func run() int {
	v.SetBuildInfo(version, Date, buildMode)

	// Start background auto-update check
	var updateCh chan updateResult
	if update.ShouldAutoUpdate() {
		updateCh = make(chan updateResult, 1)
		go func() {
			client := &http.Client{Timeout: 30 * time.Second}
			newVer, err := update.Update(client)
			updateCh <- updateResult{version: newVer, err: err}
		}()
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

	// Wait for update result
	if updateCh != nil {
		select {
		case res := <-updateCh:
			if res.err != nil {
				debug.Log("update: %v", res.err)
			} else if res.version != "" {
				fmt.Fprintf(os.Stderr, "%s\n", style.Yellow("Updated DeepSource CLI to v%s", res.version))
			}
		case <-time.After(30 * time.Second):
			debug.Log("update: timed out waiting for result")
		}
	}

	return exitCode
}
