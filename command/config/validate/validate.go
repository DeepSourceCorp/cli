package validate

import (
	"context"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/deepsourcelabs/cli/configvalidator"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/analyzers"
	"github.com/deepsourcelabs/cli/deepsource/transformers"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

// Options holds the metadata.
type Options struct {
	AnalyzerNames      []string
	AnalyzerShortcodes []string
	AnalyzersMap       map[string]string // Map for {analyzer name : shortcode}
	AnalyzersMeta      []string
	AnalyzersData      []analyzers.Analyzer

	TransformerNames      []string
	TransformerShortcodes []string
	TransformerMap        map[string]string // Map for {transformer name:shortcode}
	TransformersData      []transformers.Transformer
}

func NewCmdValidate() *cobra.Command {

	o := Options{}
	cmd := &cobra.Command{
		Use:   "validate",
		Short: "Validate DeepSource config",
		Args:  utils.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			err := o.Run()
			if err != nil {
				return err
			}
			return nil
		},
	}
	return cmd
}

// Run executes the command.
func (o *Options) Run() error {
	// Just an info
	pterm.Info.Println("DeepSource config (.deepsource.toml) is mostly present in the root directory of the project.")
	fmt.Println()

	// Extract the path of DeepSource config
	configPath, err := extractDSConfigPath()
	if err != nil {
		return err
	}

	// Read the config in the form of string and send it
	content, err := ioutil.ReadFile(configPath)
	if err != nil {
		return errors.New("Error occured while reading DeepSource config file. Exiting...")
	}

	// Fetch the list of supported analyzers and transformers' data
	// using the SDK
	err = o.getAnalyzersAndTransformersData()
	if err != nil {
		return err
	}

	// Create an instance of ConfigValidator struct
	var validator configvalidator.ConfigValidator
	var result configvalidator.Result

	// Copying data into the format accepted by configvalidator package
	analyzersData := configvalidator.AnalyzersData{
		AnalyzerNames:      o.AnalyzerNames,
		AnalyzerShortcodes: o.AnalyzerShortcodes,
		AnalyzerMap:        o.AnalyzersMap,
		AnalyzesMeta:       o.AnalyzersMeta,
	}

	transformersData := configvalidator.TransformersData{
		TransformerNames:      o.TransformerNames,
		TransformerShortcodes: o.TransformerShortcodes,
		TransformerMap:        o.TransformerMap,
	}

	// Send the config contents to get validated
	result = validator.ValidateConfig(content, analyzersData, transformersData)

	// Checking for all types of errors (due to viper/valid errors/no errors)
	// and handling them
	if result.ConfigReadError == true {
		// handle printing viper error here
		printViperError(content, result.Errors)
	} else if result.Valid == false {
		// handle printing other errors here
		printConfigErrors(result.Errors)
	} else {
		printValidConfig()
	}

	return nil
}

// Extracts the path of DeepSource config (.deepsource.toml) in the user repo
// Checks in the current working directory as well as the root directory
// of the project
func extractDSConfigPath() (string, error) {
	var configPath string

	// Get current working directory of user from where this command is run
	cwd, err := os.Getwd()
	if err != nil {
		return "", errors.New("Error occured while fetching current working directory. Exiting...")
	}

	// Form the full path of cwd to search for .deepsource.toml
	configPath = filepath.Join(cwd, ".deepsource.toml")

	// Check if there is a deepsource.toml file here
	if _, err = os.Stat(configPath); err != nil {
		// Since, no .deepsource.toml in the cwd,
		// fetching the top level directory
		output, err := exec.Command("git", "rev-parse", "--show-toplevel").Output()
		if err != nil {
			return "", err
		}

		// Removing trailing null characters
		path := strings.TrimRight(string(output), "\000\n")

		// Check if the config exists on this path
		if _, err = os.Stat(filepath.Join(path, ".deepsource.toml")); err != nil {
			return "", errors.New("Error occured while looking for DeepSource config file. Exiting...")
		} else {
			// If found, use this as configpath
			configPath = filepath.Join(path, "/.deepsource.toml")
		}
	}
	return configPath, nil
}

// Get the list of all the supported analyzers and transformers with
// their corresponding data like shortcode, metaschema etc.
func (o *Options) getAnalyzersAndTransformersData() error {
	var err error
	// Fetch the client
	deepsource := deepsource.New()
	ctx := context.Background()

	// Get supported analyzers and transformers data
	o.AnalyzersMap = make(map[string]string)
	o.TransformerMap = make(map[string]string)

	o.AnalyzersData, err = deepsource.GetSupportedAnalyzers(ctx)
	if err != nil {
		return err
	}

	o.TransformersData, err = deepsource.GetSupportedTransformers(ctx)
	if err != nil {
		return err
	}
	o.parseSDKResponse()
	return nil
}

// Handles printing the output when viper fails to read TOML file due to bad syntax
func printViperError(fileContent []byte, errors []string) {
	var errorString string
	var errorLine int

	// Parsing viper error output and finding at which line bad syntax is present in
	// DeepSource config TOML file
	for _, error := range errors {
		stripString1 := strings.Split(error, ": ")
		errorString = stripString1[2]
		errorLine, _ = strconv.Atoi(strings.Trim(strings.Split(stripString1[1], ", ")[0], "("))
	}

	// Read .deepsource.toml line by line and store in a var
	lineText := strings.Split(string(fileContent), "\n")
	fileLength := len(lineText)

	// Print error message
	pterm.Error.WithShowLineNumber(false).Printf("Error while reading config : %s\n", errorString)
	pterm.Println()

	// Preparing codeframe to show exactly at which line bad syntax is present in TOML file
	if errorLine > 2 && errorLine+2 <= fileLength {
		for i := errorLine - 2; i <= errorLine+2; i++ {
			if i == errorLine {
				errorStr := ""
				if i >= 10 {
					errorStr = fmt.Sprintf("> %d | %s", i, lineText[i-1])
				} else {
					errorStr = fmt.Sprintf(">  %d | %s", i, lineText[i-1])
				}
				pterm.NewStyle(pterm.FgLightRed).Println(errorStr)
			} else {
				errorStr := ""
				if i >= 10 {
					errorStr = fmt.Sprintf("  %d | %s", i, lineText[i-1])
				} else {
					errorStr = fmt.Sprintf("   %d | %s", i, lineText[i-1])
				}
				pterm.NewStyle(pterm.FgLightYellow).Println(errorStr)

			}
		}
	} else {
		errorStr := fmt.Sprintf(">  %d | %s", errorLine, lineText[errorLine-1])
		pterm.NewStyle(pterm.FgLightRed).Println(errorStr)
	}
}

// Handles printing the errors in the DeepSource config (.deepsource.toml)
func printConfigErrors(errors []string) {
	for _, error := range errors {
		pterm.Error.WithShowLineNumber(false).Println(error)
	}
}

// Handles printing the valid config output
func printValidConfig() {
	pterm.Success.Println("Config Valid")
}

// Parses the SDK response of analyzers and transformers data into the format required
// by this (validator) package
func (o *Options) parseSDKResponse() {
	o.AnalyzersMap = make(map[string]string)
	o.TransformerMap = make(map[string]string)

	for _, analyzer := range o.AnalyzersData {
		o.AnalyzerNames = append(o.AnalyzerNames, analyzer.Name)
		o.AnalyzerShortcodes = append(o.AnalyzerShortcodes, analyzer.Shortcode)
		o.AnalyzersMap[analyzer.Name] = analyzer.Shortcode
	}

	for _, transformer := range o.TransformersData {
		o.TransformerNames = append(o.TransformerNames, transformer.Name)
		o.TransformerShortcodes = append(o.TransformerShortcodes, transformer.Shortcode)
		o.TransformerMap[transformer.Name] = transformer.Shortcode
	}
}
