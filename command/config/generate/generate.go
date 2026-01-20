package generate

import (
	"bytes"
	"fmt"
	"os"
	"path/filepath"

	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/internal/cli/args"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	"github.com/deepsourcelabs/cli/internal/configdata"
	configsvc "github.com/deepsourcelabs/cli/internal/services/config"
	"github.com/fatih/color"
	toml "github.com/pelletier/go-toml"
	"github.com/spf13/cobra"
)

// Options holds the metadata.
type Options struct {
	ActivatedAnalyzers    []string // Analyzers activated by user
	AnalyzerMetaMap       map[string][]AnalyzerMetadata
	ActivatedTransformers []string // Transformers activated by the user
	ExcludePatterns       []string
	TestPatterns          []string
	GeneratedConfig       string
}

// NewCmdConfigGenerate handles the generation of DeepSource config based on user inputs
func NewCmdConfigGenerate() *cobra.Command {
	o := Options{}

	home, _ := os.UserHomeDir()
	doc := heredoc.Docf(`
		Generate config for the DeepSource CLI.

		Configs are stored in: %[1]s
		`, style.Cyan("%s", filepath.Join(home, "deepsource", "config.toml")))

	cmd := &cobra.Command{
		Use:   "generate",
		Short: "Generate config for DeepSource",
		Long:  doc,
		Args:  args.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			return o.Run()
		},
	}
	return cmd
}

// Run executes the command.
func (o *Options) Run() error {
	svc := configsvc.NewService(config.DefaultManager())
	cfg, err := svc.LoadConfig()
	if err != nil {
		return err
	}

	// Step 1: Collect user input
	err = o.collectUserInput(svc, cfg)
	if err != nil {
		fmt.Println("\nError occured while collecting input.Exiting...")
		return err
	}

	// Step 2: Generates config based on user input
	err = o.generateDeepSourceConfig()
	if err != nil {
		fmt.Println("\nError occured while generating config from input.Exiting...")
		return err
	}

	// Step 3: Write the generated config to a file
	err = o.writeConfigToFile()
	if err != nil {
		fmt.Println("\nError while writing config to project directory. Exiting...")
		return err
	}

	// Step 4: If everything is successfull, print the success message
	cwd, _ := os.Getwd()
	c := color.New(color.FgGreen)
	successOutput := fmt.Sprintf("\nSuccessfully generated DeepSource config file at %s/.deepsource.toml", cwd)
	c.Println(successOutput)

	return nil
}

// Generates DeepSource config based on the inputs from the user in Options struct
func (o *Options) generateDeepSourceConfig() error {
	// Copying version, exclude_patterns and test_patterns into the DSConfig based structure
	config := DSConfig{
		Version:         DEEPSOURCE_TOML_VERSION,
		ExcludePatterns: o.ExcludePatterns,
		TestPatterns:    o.TestPatterns,
	}

	// Copying activated analyzers from Options struct to DSConfig based "config" struct
	for _, analyzer := range o.ActivatedAnalyzers {
		// Configuring the analyzer meta data
		metaMap := make(map[string]interface{})
		if o.AnalyzerMetaMap[analyzer] != nil {
			for _, meta := range o.AnalyzerMetaMap[analyzer] {
				metaMap[meta.FieldName] = meta.UserInput
			}
		}

		activatedAnalyzerData := Analyzer{
			Name:    configdata.AnalyzersData.AnalyzersMap[analyzer],
			Enabled: true,
		}
		if len(metaMap) != 0 {
			activatedAnalyzerData.Meta = metaMap
		}
		config.Analyzers = append(config.Analyzers, activatedAnalyzerData)
	}

	// Copying activated transformers from Options struct to DSConfig based "config" struct
	for _, transformer := range o.ActivatedTransformers {
		config.Transformers = append(config.Transformers, Transformer{
			Name:    configdata.TransformersData.TransformerMap[transformer],
			Enabled: true,
		})
	}

	// Encoding the DSConfig based "config" struct to TOML
	// and storing in GeneratedConfig of Options struct
	var buf bytes.Buffer
	err := toml.NewEncoder(&buf).Order(toml.OrderPreserve).Encode(config)
	if err != nil {
		return err
	}
	// Convert the TOML encoded buffer to string
	o.GeneratedConfig = buf.String()
	return nil
}

// Writes the generated TOML config into a file
func (o *Options) writeConfigToFile() error {
	// Creating file
	cwd, _ := os.Getwd()
	f, err := os.Create(filepath.Join(cwd, ".deepsource.toml"))
	if err != nil {
		return err
	}
	defer f.Close()

	// Writing the string to the file
	_, writeError := f.WriteString(o.GeneratedConfig)
	if writeError != nil {
		return writeError
	}
	return nil
}
