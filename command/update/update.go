package update

import (
	"fmt"
	"net/http"
	"runtime"
	"time"

	"github.com/deepsourcelabs/cli/buildinfo"
	"github.com/deepsourcelabs/cli/internal/update"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

func NewCmdUpdate() *cobra.Command {
	return &cobra.Command{
		Use:   "update",
		Short: "Update DeepSource CLI to the latest version",
		RunE: func(cmd *cobra.Command, _ []string) error {
			return runUpdate(cmd)
		},
	}
}

func runUpdate(cmd *cobra.Command) error {
	w := cmd.ErrOrStderr()

	// Check for the latest version
	checkClient := &http.Client{Timeout: 10 * time.Second}
	if err := update.CheckForUpdate(checkClient); err != nil {
		return fmt.Errorf("checking for updates: %w", err)
	}

	state, err := update.PrepareUpdate()
	if err != nil {
		return fmt.Errorf("reading update state: %w", err)
	}

	if state == nil {
		bi := buildinfo.GetBuildInfo()
		fmt.Fprintf(w, "Already up to date (v%s)\n", bi.Version)
		return nil
	}

	fmt.Fprintln(w, pterm.Green("✓")+" Platform: "+runtime.GOOS+"/"+runtime.GOARCH)
	fmt.Fprintln(w, pterm.Green("✓")+" Version: v"+state.Version)

	applyClient := &http.Client{Timeout: 5 * time.Minute}
	data, err := update.DownloadUpdate(applyClient, state)
	if err != nil {
		return fmt.Errorf("downloading update: %w", err)
	}
	fmt.Fprintln(w, pterm.Green("✓")+" Downloaded")

	if err := update.VerifyUpdate(data, state); err != nil {
		return fmt.Errorf("verifying update: %w", err)
	}
	fmt.Fprintln(w, pterm.Green("✓")+" Checksum verified")

	if err := update.ExtractAndInstall(data, state.ArchiveURL); err != nil {
		return fmt.Errorf("installing update: %w", err)
	}
	fmt.Fprintln(w, pterm.Green("✓")+" Installed")

	return nil
}
