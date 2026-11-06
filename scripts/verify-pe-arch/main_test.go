package main

import (
	"archive/zip"
	"bytes"
	"debug/pe"
	"encoding/binary"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func writeMinimalPE(t *testing.T, machine uint16) []byte {
	t.Helper()

	data := make([]byte, 0x80)
	data[0] = 'M'
	data[1] = 'Z'
	binary.LittleEndian.PutUint32(data[0x3c:], 0x40)
	copy(data[0x40:], []byte{'P', 'E', 0, 0})
	binary.LittleEndian.PutUint16(data[0x44:], machine)
	return data
}

func TestRunRawPE(t *testing.T) {
	path := filepath.Join(t.TempDir(), "test.exe")
	if err := os.WriteFile(path, writeMinimalPE(t, pe.IMAGE_FILE_MACHINE_ARM64), 0o600); err != nil {
		t.Fatal(err)
	}

	var stdout, stderr bytes.Buffer
	if code := run([]string{"-arch", "arm64", path}, &stdout, &stderr); code != 0 {
		t.Fatalf("run returned %d: %s", code, stderr.String())
	}
	if !strings.Contains(stdout.String(), "0xaa64 (arm64)") {
		t.Fatalf("unexpected output: %s", stdout.String())
	}
}

func TestRunZipDetectsMismatch(t *testing.T) {
	path := filepath.Join(t.TempDir(), "test.zip")
	file, err := os.Create(path)
	if err != nil {
		t.Fatal(err)
	}
	archive := zip.NewWriter(file)
	entry, err := archive.Create("deepsource.exe")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := entry.Write(writeMinimalPE(t, pe.IMAGE_FILE_MACHINE_AMD64)); err != nil {
		t.Fatal(err)
	}
	if err := archive.Close(); err != nil {
		t.Fatal(err)
	}
	if err := file.Close(); err != nil {
		t.Fatal(err)
	}

	var stdout, stderr bytes.Buffer
	if code := run([]string{"-arch", "arm64", path}, &stdout, &stderr); code != 1 {
		t.Fatalf("run returned %d, want 1", code)
	}
	if !strings.Contains(stderr.String(), "expected arm64, got amd64") {
		t.Fatalf("unexpected error: %s", stderr.String())
	}
}

func TestRunZipRejectsMultipleExecutables(t *testing.T) {
	path := filepath.Join(t.TempDir(), "test.zip")
	file, err := os.Create(path)
	if err != nil {
		t.Fatal(err)
	}
	archive := zip.NewWriter(file)
	for _, name := range []string{"deepsource.exe", "helper.exe"} {
		entry, err := archive.Create(name)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := entry.Write(writeMinimalPE(t, pe.IMAGE_FILE_MACHINE_ARM64)); err != nil {
			t.Fatal(err)
		}
	}
	if err := archive.Close(); err != nil {
		t.Fatal(err)
	}
	if err := file.Close(); err != nil {
		t.Fatal(err)
	}

	var stdout, stderr bytes.Buffer
	if code := run([]string{"-arch", "arm64", path}, &stdout, &stderr); code != 1 {
		t.Fatalf("run returned %d, want 1", code)
	}
	if !strings.Contains(stderr.String(), "multiple .exe entries") {
		t.Fatalf("unexpected error: %s", stderr.String())
	}
}
