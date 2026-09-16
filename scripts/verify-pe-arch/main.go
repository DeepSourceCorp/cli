// Command verify-pe-arch checks that a Windows PE binary (or the single .exe
// entry inside a .zip release archive) reports the expected machine
// architecture in its PE header. It is used by both CI.yml and
// build-and-deploy.yml to catch cases where a "windows/arm64" build silently
// produces an amd64 (or otherwise wrong) binary.
//
// It only depends on the Go standard library (archive/zip, debug/pe) so it
// runs identically on Linux (release cross-compile job) and Windows (CI
// native jobs) via `go run ./scripts/verify-pe-arch`.
package main

import (
	"archive/zip"
	"bytes"
	"debug/pe"
	"flag"
	"fmt"
	"io"
	"os"
	"strings"
)

// archForMachine maps a PE FileHeader.Machine value to the GOARCH-style name
// used in this repository's build matrices.
func archForMachine(machine uint16) string {
	switch machine {
	case pe.IMAGE_FILE_MACHINE_AMD64:
		return "amd64"
	case pe.IMAGE_FILE_MACHINE_ARM64:
		return "arm64"
	case pe.IMAGE_FILE_MACHINE_I386:
		return "386"
	case pe.IMAGE_FILE_MACHINE_ARMNT:
		return "arm"
	default:
		return fmt.Sprintf("unknown(0x%04x)", machine)
	}
}

// machineFromPEFile parses a raw PE file on disk and returns its machine type.
func machineFromPEFile(path string) (uint16, error) {
	f, err := pe.Open(path)
	if err != nil {
		return 0, fmt.Errorf("parsing PE file %q: %w", path, err)
	}
	defer f.Close()
	return f.FileHeader.Machine, nil
}

// machineFromZip finds the single .exe entry inside a .zip release archive
// and returns its machine type, without extracting anything to disk.
func machineFromZip(path string) (uint16, error) {
	zr, err := zip.OpenReader(path)
	if err != nil {
		return 0, fmt.Errorf("opening zip %q: %w", path, err)
	}
	defer zr.Close()

	var exeFile *zip.File
	for _, f := range zr.File {
		if strings.HasSuffix(strings.ToLower(f.Name), ".exe") {
			if exeFile != nil {
				return 0, fmt.Errorf("multiple .exe entries found in %q", path)
			}
			exeFile = f
		}
	}
	if exeFile == nil {
		return 0, fmt.Errorf("no .exe entry found in %q", path)
	}

	rc, err := exeFile.Open()
	if err != nil {
		return 0, fmt.Errorf("opening zip entry %q: %w", exeFile.Name, err)
	}
	defer rc.Close()

	data, err := io.ReadAll(rc)
	if err != nil {
		return 0, fmt.Errorf("reading zip entry %q: %w", exeFile.Name, err)
	}

	pf, err := pe.NewFile(bytes.NewReader(data))
	if err != nil {
		return 0, fmt.Errorf("parsing PE data from %q: %w", exeFile.Name, err)
	}
	defer pf.Close()
	return pf.FileHeader.Machine, nil
}

func run(args []string, stdout, stderr io.Writer) int {
	fs := flag.NewFlagSet("verify-pe-arch", flag.ContinueOnError)
	fs.SetOutput(stderr)
	arch := fs.String("arch", "", "expected architecture (amd64 or arm64)")
	fs.Usage = func() {
		fmt.Fprintf(stderr, "usage: verify-pe-arch -arch <amd64|arm64> <path-to-.exe-or-.zip>\n")
		fs.PrintDefaults()
	}
	if err := fs.Parse(args); err != nil {
		return 2
	}
	if *arch == "" || fs.NArg() != 1 {
		fs.Usage()
		return 2
	}
	path := fs.Arg(0)

	var (
		machine uint16
		err     error
	)
	if strings.HasSuffix(strings.ToLower(path), ".zip") {
		machine, err = machineFromZip(path)
	} else {
		machine, err = machineFromPEFile(path)
	}
	if err != nil {
		fmt.Fprintf(stderr, "error: %v\n", err)
		return 1
	}

	got := archForMachine(machine)
	fmt.Fprintf(stdout, "%s: PE machine=0x%04x (%s)\n", path, machine, got)
	if got != *arch {
		fmt.Fprintf(stderr, "architecture mismatch: expected %s, got %s\n", *arch, got)
		return 1
	}
	return 0
}

func main() {
	os.Exit(run(os.Args[1:], os.Stdout, os.Stderr))
}
