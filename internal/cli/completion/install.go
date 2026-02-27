package completion

import (
	"bytes"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/deepsourcelabs/cli/internal/cli/style"
	"github.com/spf13/cobra"
)

// Install detects the user's shell from $SHELL, generates the completion
// script for the root command, and writes it to the standard location.
func Install(rootCmd *cobra.Command, w io.Writer) error {
	shell := filepath.Base(os.Getenv("SHELL"))

	home, err := os.UserHomeDir()
	if err != nil {
		return fmt.Errorf("could not determine home directory: %w", err)
	}

	var buf bytes.Buffer
	var destPath string

	switch shell {
	case "bash":
		if err := rootCmd.GenBashCompletionV2(&buf, true); err != nil {
			return fmt.Errorf("generating bash completions: %w", err)
		}
		destPath = filepath.Join(home, ".local", "share", "bash-completion", "completions", "deepsource")

	case "zsh":
		if err := rootCmd.GenZshCompletion(&buf); err != nil {
			return fmt.Errorf("generating zsh completions: %w", err)
		}
		destPath = filepath.Join(home, ".zsh", "completions", "_deepsource")

		if err := ensureZshFpath(home); err != nil {
			return err
		}

	case "fish":
		if err := rootCmd.GenFishCompletion(&buf, true); err != nil {
			return fmt.Errorf("generating fish completions: %w", err)
		}
		destPath = filepath.Join(home, ".config", "fish", "completions", "deepsource.fish")

	default:
		return fmt.Errorf("unsupported shell %q — supported shells: bash, zsh, fish", shell)
	}

	if err := os.MkdirAll(filepath.Dir(destPath), 0o750); err != nil {
		return fmt.Errorf("creating directory %s: %w", filepath.Dir(destPath), err)
	}

	if err := os.WriteFile(destPath, buf.Bytes(), 0o644); err != nil {
		return fmt.Errorf("writing completion file %s: %w", destPath, err)
	}

	style.Successf(w, "shell completions installed to %s — restart your shell to activate", destPath)
	return nil
}

// ensureZshFpath appends the fpath line to ~/.zshrc if not already present.
func ensureZshFpath(home string) error {
	fpathLine := `fpath=(~/.zsh/completions $fpath)`
	zshrc := filepath.Join(home, ".zshrc")

	data, err := os.ReadFile(zshrc)
	if err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("reading %s: %w", zshrc, err)
	}

	if strings.Contains(string(data), fpathLine) {
		return nil
	}

	f, err := os.OpenFile(zshrc, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o600)
	if err != nil {
		return fmt.Errorf("opening %s: %w", zshrc, err)
	}
	defer f.Close()

	if _, err := fmt.Fprintf(f, "\n# Added by deepsource CLI (shell completions)\n%s\nautoload -Uz compinit && compinit\n", fpathLine); err != nil {
		return fmt.Errorf("writing fpath to %s: %w", zshrc, err)
	}

	return nil
}
