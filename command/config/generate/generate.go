package generate

import (
	"bytes"
	"fmt"
	"os"
	"path/filepath"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/utils"
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

	cmd := &cobra.Command{
		Use:   "generate",
		Short: "Generate config for DeepSource",
		Args:  utils.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			return o.Run()
		},
	}
	return cmd
}

// Run executes the command.
func (o *Options) Run() error {
	// Fetch config
	cfg, err := config.GetConfig()
	if err != nil {
		return fmt.Errorf("Error while reading DeepSource CLI config : %v", err)
	}
	err = cfg.VerifyAuthentication()
	if err != nil {
		return err
	}

	// Step 1: Collect user input
	err = o.collectUserInput()
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
	cwd, err := os.Getwd()
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
			Name:    utils.AnaData.AnalyzersMap[analyzer],
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
			Name:    utils.TrData.TransformerMap[transformer],
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
