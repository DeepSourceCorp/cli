package generate

import (
	"bytes"
	"fmt"
	"log"
	"os"

	"github.com/kyokomi/emoji/v2"
	toml "github.com/pelletier/go-toml"
	"github.com/spf13/cobra"
)

// Options holds the metadata.
type Options struct {
	ActivatedAnalyzers    []string
	ActivatedTransformers []string
	ExcludePatterns       []string
	TestPatterns          []string
	GoImportRoot          string // Mandatory meta for Go
	JavaVersion           string // Mandatory meta for JAVA
	GeneratedConfig       string
}

// NewCmdVersion returns the current version of cli being used
func NewCmdConfigGenerate() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "generate",
		Short: "Generate config for DeepSource",
		Run: func(cmd *cobra.Command, args []string) {
			o := Options{}
			o.Run()
		},
	}
	return cmd
}

// Validate impletments the Validate method for the ICommand interface.
func (o *Options) Validate() error {
	return nil
}

// Run executes the command.
func (o *Options) Run() {

	o.collectUserInput()

	o.generateDeepSourceConfig()

	err := o.writeConfigToFile()
	if err != nil {
		fmt.Println("Error while writing config to project directory. Exiting...")
		os.Exit(1)
	}

	emoji.Println(":beer: DeepSource Config Generated :tada::sparkles:")
}

func (o *Options) generateDeepSourceConfig() {

	config := DSConfig{
		Version:         0,
		ExcludePatterns: []string{},
		TestPatterns:    []string{},
		Analyzers:       []Analyzer{},
		Transformers:    []Transformer{},
	}

	// TODO: Remove this hard coding of version
	config.Version = 1
	config.TestPatterns = o.TestPatterns
	config.ExcludePatterns = o.ExcludePatterns

	for index, analyzer := range o.ActivatedAnalyzers {

		config.Analyzers = append(config.Analyzers, Analyzer{
			Name:                analyzer,
			RuntimeVersion:      "",
			Enabled:             true,
			DependencyFilePaths: []string{},
			Thresholds:          nil,
		})
		if analyzer == "Go" {
			config.Analyzers[index].Meta.ImportRoot = o.GoImportRoot
		}

		if analyzer == "Java (beta)" {
			config.Analyzers[index].Meta.JavaVersion = o.JavaVersion
		}
	}

	for _, transformer := range o.ActivatedTransformers {
		config.Transformers = append(config.Transformers, Transformer{
			Name:    transformer,
			Enabled: true,
		})
	}

	var buf bytes.Buffer
	err := toml.NewEncoder(&buf).Order(toml.OrderPreserve).Encode(config)
	if err != nil {
		log.Fatal(err)
	}
	o.GeneratedConfig = buf.String()
}

func (o *Options) writeConfigToFile() error {

	f, err := os.Create(".deepsource.toml")

	if err != nil {
		return err
	}

	defer f.Close()

	_, writeError := f.WriteString(o.GeneratedConfig)

	if writeError != nil {
		return writeError
	}

	return nil
}
