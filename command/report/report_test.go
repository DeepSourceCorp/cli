package report

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestReportOptions_sanitize(t *testing.T) {
	t.Run("trims whitespace from all fields", func(t *testing.T) {
		t.Setenv("DEEPSOURCE_DSN", "  https://token@host  ")

		opts := ReportOptions{
			Analyzer:               "  test-coverage  ",
			AnalyzerType:           "  community  ",
			Key:                    "  python  ",
			Value:                  "  test  ",
			ValueFile:              "  coverage.xml  ",
			OIDCRequestToken:       "  token  ",
			OIDCRequestUrl:         "  url  ",
			DeepSourceHostEndpoint: "  https://app.deepsource.com  ",
		}

		opts.sanitize()

		assert.Equal(t, "test-coverage", opts.Analyzer)
		assert.Equal(t, "community", opts.AnalyzerType)
		assert.Equal(t, "python", opts.Key)
		assert.Equal(t, "test", opts.Value)
		assert.Equal(t, "coverage.xml", opts.ValueFile)
		assert.Equal(t, "https://token@host", opts.DSN)
		assert.Equal(t, "token", opts.OIDCRequestToken)
		assert.Equal(t, "url", opts.OIDCRequestUrl)
		assert.Equal(t, "https://app.deepsource.com", opts.DeepSourceHostEndpoint)
	})

	t.Run("handles empty fields", func(t *testing.T) {
		t.Setenv("DEEPSOURCE_DSN", "")

		opts := ReportOptions{}
		opts.sanitize()

		assert.Equal(t, "", opts.Analyzer)
		assert.Equal(t, "", opts.AnalyzerType)
		assert.Equal(t, "", opts.Key)
		assert.Equal(t, "", opts.Value)
		assert.Equal(t, "", opts.ValueFile)
		assert.Equal(t, "", opts.DSN)
	})

	t.Run("reads DSN from environment", func(t *testing.T) {
		t.Setenv("DEEPSOURCE_DSN", "https://mytoken@app.deepsource.com")

		opts := ReportOptions{}
		opts.sanitize()

		assert.Equal(t, "https://mytoken@app.deepsource.com", opts.DSN)
	})

	t.Run("handles whitespace-only values", func(t *testing.T) {
		t.Setenv("DEEPSOURCE_DSN", "   ")

		opts := ReportOptions{
			Analyzer: "   ",
			Key:      "   ",
		}
		opts.sanitize()

		assert.Equal(t, "", opts.Analyzer)
		assert.Equal(t, "", opts.Key)
		assert.Equal(t, "", opts.DSN)
	})
}

func TestReportOptions_validateKey(t *testing.T) {
	validKeys := []string{
		"python", "go", "javascript", "ruby", "java",
		"scala", "php", "csharp", "cxx", "rust", "swift", "kotlin",
	}

	t.Run("valid keys for test-coverage", func(t *testing.T) {
		for _, key := range validKeys {
			t.Run(key, func(t *testing.T) {
				opts := ReportOptions{
					Analyzer: "test-coverage",
					Key:      key,
				}
				err := opts.validateKey()
				assert.NoError(t, err)
			})
		}
	})

	t.Run("invalid key for test-coverage", func(t *testing.T) {
		opts := ReportOptions{
			Analyzer: "test-coverage",
			Key:      "invalid-language",
		}
		err := opts.validateKey()
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "Invalid Key: invalid-language")
	})

	t.Run("empty key for test-coverage", func(t *testing.T) {
		opts := ReportOptions{
			Analyzer: "test-coverage",
			Key:      "",
		}
		err := opts.validateKey()
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "Invalid Key")
	})

	t.Run("non test-coverage analyzer skips validation", func(t *testing.T) {
		opts := ReportOptions{
			Analyzer: "other-analyzer",
			Key:      "anything-goes",
		}
		err := opts.validateKey()
		assert.NoError(t, err)
	})

	t.Run("empty analyzer skips validation", func(t *testing.T) {
		opts := ReportOptions{
			Analyzer: "",
			Key:      "invalid",
		}
		err := opts.validateKey()
		assert.NoError(t, err)
	})
}

func TestNewCmdReport(t *testing.T) {
	t.Run("creates command with correct properties", func(t *testing.T) {
		cmd := NewCmdReport()
		assert.Equal(t, "report", cmd.Use)
		assert.Equal(t, "Report artifacts to DeepSource", cmd.Short)
		assert.NotEmpty(t, cmd.Long)
	})

	flagTests := []struct {
		name        string
		defValue    string
		hasDefValue bool
	}{
		{name: "analyzer", defValue: "", hasDefValue: true},
		{name: "analyzer-type"},
		{name: "key"},
		{name: "value"},
		{name: "value-file"},
		{name: "use-oidc", defValue: "false", hasDefValue: true},
		{name: "skip-verify", defValue: "false", hasDefValue: true},
		{name: "deepsource-host-endpoint", defValue: "https://app.deepsource.com", hasDefValue: true},
		{name: "oidc-provider"},
	}

	cmd := NewCmdReport()

	for _, tt := range flagTests {
		t.Run("has "+tt.name+" flag", func(t *testing.T) {
			flag := cmd.Flags().Lookup(tt.name)
			assert.NotNil(t, flag)
			if tt.hasDefValue {
				assert.Equal(t, tt.defValue, flag.DefValue)
			}
		})
	}
}

func TestValueFileReading(t *testing.T) {
	t.Run("reads existing file", func(t *testing.T) {
		tmpDir := t.TempDir()
		filePath := filepath.Join(tmpDir, "coverage.xml")
		content := "<coverage>test data</coverage>"
		err := os.WriteFile(filePath, []byte(content), 0644)
		assert.NoError(t, err)

		// Verify file was created and can be read
		data, err := os.ReadFile(filePath)
		assert.NoError(t, err)
		assert.Equal(t, content, string(data))
	})

	t.Run("stat fails for non-existent file", func(t *testing.T) {
		_, err := os.Stat("/non/existent/path/coverage.xml")
		assert.Error(t, err)
		assert.True(t, os.IsNotExist(err))
	})

	t.Run("reads large file", func(t *testing.T) {
		tmpDir := t.TempDir()
		filePath := filepath.Join(tmpDir, "large.xml")

		// Create a 1MB file
		data := make([]byte, 1024*1024)
		for i := range data {
			data[i] = byte('A' + (i % 26))
		}
		err := os.WriteFile(filePath, data, 0644)
		assert.NoError(t, err)

		// Verify file can be read
		readData, err := os.ReadFile(filePath)
		assert.NoError(t, err)
		assert.Len(t, readData, 1024*1024)
	})
}
