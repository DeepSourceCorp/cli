package completion

import (
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/spf13/cobra"
)

func testRootCmd() *cobra.Command {
	return &cobra.Command{Use: "deepsource"}
}

func TestInstallBash(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("SHELL", "/bin/bash")

	var buf bytes.Buffer
	if err := Install(testRootCmd(), &buf); err != nil {
		t.Fatalf("Install() error: %v", err)
	}

	path := filepath.Join(home, ".local", "share", "bash-completion", "completions", "deepsource")
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("completion file not found: %v", err)
	}
	if len(data) == 0 {
		t.Fatal("completion file is empty")
	}
	if !strings.Contains(buf.String(), "installed") {
		t.Errorf("expected success message, got: %s", buf.String())
	}
}

func TestInstallZsh(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("SHELL", "/bin/zsh")

	var buf bytes.Buffer
	if err := Install(testRootCmd(), &buf); err != nil {
		t.Fatalf("Install() error: %v", err)
	}

	// Check completion file
	path := filepath.Join(home, ".zsh", "completions", "_deepsource")
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("completion file not found: %v", err)
	}
	if len(data) == 0 {
		t.Fatal("completion file is empty")
	}

	// Check fpath line added to .zshrc
	zshrc, err := os.ReadFile(filepath.Join(home, ".zshrc"))
	if err != nil {
		t.Fatalf(".zshrc not found: %v", err)
	}
	if !strings.Contains(string(zshrc), "fpath=(~/.zsh/completions $fpath)") {
		t.Error(".zshrc missing fpath line")
	}
}

func TestInstallZshIdempotent(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("SHELL", "/bin/zsh")

	var buf bytes.Buffer
	if err := Install(testRootCmd(), &buf); err != nil {
		t.Fatalf("first Install() error: %v", err)
	}
	if err := Install(testRootCmd(), &buf); err != nil {
		t.Fatalf("second Install() error: %v", err)
	}

	zshrc, _ := os.ReadFile(filepath.Join(home, ".zshrc"))
	count := strings.Count(string(zshrc), "fpath=(~/.zsh/completions $fpath)")
	if count != 1 {
		t.Errorf("fpath line appeared %d times, want 1", count)
	}
}

func TestInstallFish(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("SHELL", "/usr/bin/fish")

	var buf bytes.Buffer
	if err := Install(testRootCmd(), &buf); err != nil {
		t.Fatalf("Install() error: %v", err)
	}

	path := filepath.Join(home, ".config", "fish", "completions", "deepsource.fish")
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("completion file not found: %v", err)
	}
	if len(data) == 0 {
		t.Fatal("completion file is empty")
	}
}

func TestInstallUnsupportedShell(t *testing.T) {
	t.Setenv("HOME", t.TempDir())
	t.Setenv("SHELL", "/bin/csh")

	var buf bytes.Buffer
	err := Install(testRootCmd(), &buf)
	if err == nil {
		t.Fatal("expected error for unsupported shell")
	}
	if !strings.Contains(err.Error(), "unsupported shell") {
		t.Errorf("unexpected error: %v", err)
	}
}
