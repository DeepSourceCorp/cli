package generate

import (
	"bytes"
	"fmt"
	"os"
	"path/filepath"

	"github.com/deepsourcelabs/cli/api"
	"github.com/deepsourcelabs/cli/cmdutils"
	"github.com/fatih/color"
	toml "github.com/pelletier/go-toml"
	"github.com/spf13/cobra"
)

// Options holds the metadata.
type Options struct {
	gqlClient *api.DSClient

	AnalyzerNames         []string
	AnalyzerShortcodes    []string
	AnalyzersMap          map[string]string // Map for {analyzer name : shortcode}
	TransformerNames      []string
	TransformerShortcodes []string
	TransformerMap        map[string]string // Map for {transformer name:shortcode}

	GoImportRoot string // Mandatory meta for Go
	JavaVersion  string // Mandatory meta for JAVA

	ActivatedAnalyzers    []string
	ActivatedTransformers []string
	ExcludePatterns       []string
	TestPatterns          []string

	GeneratedConfig string
}

// NewCmdVersion returns the current version of cli being used
func NewCmdConfigGenerate(cf *cmdutils.CLIFactory) *cobra.Command {

	o := Options{
		gqlClient: cf.GQLClient,
	}

	cmd := &cobra.Command{
		Use:   "generate",
		Short: "Generate config for DeepSource",
		RunE: func(cmd *cobra.Command, args []string) error {
			err := o.Run()
			if err != nil {
				return err
			}
			return nil
		},
		SilenceErrors: true,
		SilenceUsage:  true,
	}
	return cmd
}
// Validate impletments the Validate method for the ICommand interface.
func (o *Options) Validate() error {
	return nil
}

// Run executes the command.
func (o *Options) Run() error {

	// Collect user input
	err := o.collectUserInput()
	if err != nil {
		fmt.Println("\nError occured while collecting input.Exiting...")
		return err
	}

	// Generates config based on user input
	err = o.generateDeepSourceConfig()
	if err != nil {
		fmt.Println("\nError occured while generating config from input.Exiting...")
		return err
	}

	// Write the generated config to a file
	err = o.writeConfigToFile()
	if err != nil {
		fmt.Println("\nError while writing config to project directory. Exiting...")
		return err
	}

	// Success output ricing
	cwd, err := os.Getwd()
	c := color.New(color.FgGreen)
	successOutput := fmt.Sprintf("\nSuccessfully generated DeepSource config file at %s/.deepsource.toml", cwd)
	c.Println(successOutput)

	return nil
}

// Generates DeepSource config based on the inputs from the user in Options struct
func (o *Options) generateDeepSourceConfig() error {

	// Copying everything from Options struct to DeepSource config based struct
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

	// Copying analyzers from Options struct to DSConfig based "config" struct
	for index, analyzer := range o.ActivatedAnalyzers {

		config.Analyzers = append(config.Analyzers, Analyzer{
			Name:                o.AnalyzersMap[analyzer],
			RuntimeVersion:      "",
			Enabled:             true,
			DependencyFilePaths: []string{},
			Thresholds:          nil,
		})

		// Adding these conditions since meta of these two analyzers(Go and Java) is mandatory
		if analyzer == "Go" {
			config.Analyzers[index].Meta.ImportRoot = o.GoImportRoot
		}

		if analyzer == "Java (beta)" {
			config.Analyzers[index].Meta.JavaVersion = o.JavaVersion
		}
	}

	// Copying transformers from Options struct to DSConfig based "config" struct
	for _, transformer := range o.ActivatedTransformers {
		config.Transformers = append(config.Transformers, Transformer{
			Name:    o.TransformerMap[transformer],
			Enabled: true,
		})
	}

	// Encoding the DSConfig based "config" struct to TOML
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
