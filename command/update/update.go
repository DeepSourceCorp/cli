package update

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/deepsourcelabs/cli/buildinfo"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	"github.com/deepsourcelabs/cli/internal/update"
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

	state, err := update.ReadUpdateState()
	if err != nil {
		return fmt.Errorf("reading update state: %w", err)
	}

	if state == nil {
		bi := buildinfo.GetBuildInfo()
		fmt.Fprintf(w, "Already up to date (v%s)\n", bi.Version)
		return nil
	}

	fmt.Fprintf(w, "Updating to v%s...\n", state.Version)

	applyClient := &http.Client{Timeout: 30 * time.Second}
	newVer, err := update.ApplyUpdate(applyClient)
	if err != nil {
		return fmt.Errorf("applying update: %w", err)
	}

	if newVer != "" {
		style.Successf(os.Stderr, "Updated DeepSource CLI to v%s", newVer)
	}

	return nil
}
