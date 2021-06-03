package validation

import (
	"testing"
)

// Main function (TO BE REMOVED SOON)
func TestValidateConfig(t *testing.T) {
	// Make a toml string here and send it on ValidateConfig
	var tomlData = []byte(`
version = 1

exclude_patterns = [
    "hello",
    "world",
]

[[analyzers]]
name = "go"
enabled = true

  [analyzers.meta]
  import_paths = ["github.com/siddhant-deepsource/elsa"]

[[transformers]]
name = "gofmt"
enabled = false

[[transformers]]
name = "prettier"
enabled = true`)

	err := ValidateConfig(tomlData)
	if err != nil {
		t.Error(err)
	}
}
