package generate

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/deepsourcelabs/cli/utils"
	"github.com/stretchr/testify/assert"
)

func setupTestAnalyzerData() {
	utils.AnalyzersData.AnalyzerNames = []string{"Python", "Go", "JavaScript"}
	utils.AnalyzersData.AnalyzerShortcodes = []string{"python", "go", "javascript"}
	utils.AnalyzersData.AnalyzersMap = map[string]string{
		"Python":     "python",
		"Go":         "go",
		"JavaScript": "javascript",
	}
	utils.TransformersData.TransformerNames = []string{"Black", "Prettier"}
	utils.TransformersData.TransformerShortcodes = []string{"black", "prettier"}
	utils.TransformersData.TransformerMap = map[string]string{
		"Black":    "black",
		"Prettier": "prettier",
	}
}

func TestNewCmdConfigGenerate(t *testing.T) {
	t.Run("creates command with correct properties", func(t *testing.T) {
		cmd := NewCmdConfigGenerate()
		assert.Equal(t, "generate", cmd.Use)
		assert.Equal(t, "Generate config for DeepSource", cmd.Short)
		assert.NotEmpty(t, cmd.Long)
	})
}

func TestOptions_generateDeepSourceConfig(t *testing.T) {
	setupTestAnalyzerData()

	t.Run("single analyzer without meta", func(t *testing.T) {
		o := &Options{
			ActivatedAnalyzers: []string{"Python"},
		}

		err := o.generateDeepSourceConfig()
		assert.NoError(t, err)
		assert.Contains(t, o.GeneratedConfig, "version = 1")
		assert.Contains(t, o.GeneratedConfig, "name = \"python\"")
		assert.Contains(t, o.GeneratedConfig, "enabled = true")
	})

	t.Run("single analyzer with metadata", func(t *testing.T) {
		o := &Options{
			ActivatedAnalyzers: []string{"Python"},
			AnalyzerMetaMap: map[string][]AnalyzerMetadata{
				"Python": {
					{FieldName: "max_line_length", UserInput: "100"},
				},
			},
		}

		err := o.generateDeepSourceConfig()
		assert.NoError(t, err)
		assert.Contains(t, o.GeneratedConfig, "version = 1")
		assert.Contains(t, o.GeneratedConfig, "name = \"python\"")
		assert.Contains(t, o.GeneratedConfig, "[analyzers.meta]")
		assert.Contains(t, o.GeneratedConfig, "max_line_length")
	})

	t.Run("multiple analyzers", func(t *testing.T) {
		o := &Options{
			ActivatedAnalyzers: []string{"Python", "Go"},
		}

		err := o.generateDeepSourceConfig()
		assert.NoError(t, err)
		assert.Contains(t, o.GeneratedConfig, "name = \"python\"")
		assert.Contains(t, o.GeneratedConfig, "name = \"go\"")
	})

	t.Run("with transformers", func(t *testing.T) {
		o := &Options{
			ActivatedAnalyzers:    []string{"Python"},
			ActivatedTransformers: []string{"Black"},
		}

		err := o.generateDeepSourceConfig()
		assert.NoError(t, err)
		assert.Contains(t, o.GeneratedConfig, "name = \"python\"")
		assert.Contains(t, o.GeneratedConfig, "name = \"black\"")
		assert.Contains(t, o.GeneratedConfig, "[[transformers]]")
	})

	t.Run("with exclude patterns", func(t *testing.T) {
		o := &Options{
			ActivatedAnalyzers: []string{"Python"},
			ExcludePatterns:    []string{"vendor/**", "*.generated.go"},
		}

		err := o.generateDeepSourceConfig()
		assert.NoError(t, err)
		assert.Contains(t, o.GeneratedConfig, "exclude_patterns")
		assert.Contains(t, o.GeneratedConfig, "vendor/**")
	})

	t.Run("with test patterns", func(t *testing.T) {
		o := &Options{
			ActivatedAnalyzers: []string{"Python"},
			TestPatterns:       []string{"tests/**", "*_test.py"},
		}

		err := o.generateDeepSourceConfig()
		assert.NoError(t, err)
		assert.Contains(t, o.GeneratedConfig, "test_patterns")
		assert.Contains(t, o.GeneratedConfig, "tests/**")
	})

	t.Run("empty options generates minimal config", func(t *testing.T) {
		o := &Options{}

		err := o.generateDeepSourceConfig()
		assert.NoError(t, err)
		assert.Contains(t, o.GeneratedConfig, "version = 1")
	})
}

func TestOptions_writeConfigToFile(t *testing.T) {
	t.Run("writes config to file successfully", func(t *testing.T) {
		tmpDir := t.TempDir()
		originalWd, _ := os.Getwd()
		os.Chdir(tmpDir)
		defer os.Chdir(originalWd)

		o := &Options{
			GeneratedConfig: "version = 1\n[[analyzers]]\nname = \"python\"\nenabled = true",
		}

		err := o.writeConfigToFile()
		assert.NoError(t, err)

		// Verify file was created
		content, err := os.ReadFile(filepath.Join(tmpDir, ".deepsource.toml"))
		assert.NoError(t, err)
		assert.Equal(t, o.GeneratedConfig, string(content))
	})

	t.Run("creates .deepsource.toml file", func(t *testing.T) {
		tmpDir := t.TempDir()
		originalWd, _ := os.Getwd()
		os.Chdir(tmpDir)
		defer os.Chdir(originalWd)

		o := &Options{
			GeneratedConfig: "version = 1",
		}

		err := o.writeConfigToFile()
		assert.NoError(t, err)

		// Verify file exists
		_, err = os.Stat(filepath.Join(tmpDir, ".deepsource.toml"))
		assert.NoError(t, err)
	})

	t.Run("overwrites existing file", func(t *testing.T) {
		tmpDir := t.TempDir()
		originalWd, _ := os.Getwd()
		os.Chdir(tmpDir)
		defer os.Chdir(originalWd)

		// Create existing file
		os.WriteFile(filepath.Join(tmpDir, ".deepsource.toml"), []byte("old content"), 0644)

		o := &Options{
			GeneratedConfig: "new content",
		}

		err := o.writeConfigToFile()
		assert.NoError(t, err)

		// Verify file was overwritten
		content, err := os.ReadFile(filepath.Join(tmpDir, ".deepsource.toml"))
		assert.NoError(t, err)
		assert.Equal(t, "new content", string(content))
	})
}

func TestDSConfig(t *testing.T) {
	t.Run("config struct has correct fields", func(t *testing.T) {
		config := DSConfig{
			Version:         1,
			ExcludePatterns: []string{"vendor/**"},
			TestPatterns:    []string{"tests/**"},
			Analyzers: []Analyzer{
				{Name: "python", Enabled: true},
			},
			Transformers: []Transformer{
				{Name: "black", Enabled: true},
			},
		}

		assert.Equal(t, 1, config.Version)
		assert.Len(t, config.ExcludePatterns, 1)
		assert.Len(t, config.TestPatterns, 1)
		assert.Len(t, config.Analyzers, 1)
		assert.Len(t, config.Transformers, 1)
	})
}

func TestAnalyzer(t *testing.T) {
	t.Run("analyzer struct has correct fields", func(t *testing.T) {
		analyzer := Analyzer{
			Name:    "python",
			Enabled: true,
			Meta: map[string]interface{}{
				"max_line_length": 100,
			},
		}

		assert.Equal(t, "python", analyzer.Name)
		assert.True(t, analyzer.Enabled)
		assert.NotNil(t, analyzer.Meta)
	})
}

func TestTransformer(t *testing.T) {
	t.Run("transformer struct has correct fields", func(t *testing.T) {
		transformer := Transformer{
			Name:    "black",
			Enabled: true,
		}

		assert.Equal(t, "black", transformer.Name)
		assert.True(t, transformer.Enabled)
	})
}

func TestConstants(t *testing.T) {
	t.Run("DEEPSOURCE_TOML_VERSION is 1", func(t *testing.T) {
		assert.Equal(t, 1, DEEPSOURCE_TOML_VERSION)
	})
}
