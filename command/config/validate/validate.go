package validate

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/configvalidator"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

// Options holds the metadata.
type Options struct{}

// NewCmdValidate handles the validation of the DeepSource config (.deepsource.toml)
// Internally it uses the package `configvalidator` to validate the config
func NewCmdValidate() *cobra.Command {

	o := Options{}
	cmd := &cobra.Command{
		Use:   "validate",
		Short: "Validate DeepSource config",
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
	err = utils.GetAnalyzersAndTransformersData()
	if err != nil {
		return err
	}

	// Create an instance of ConfigValidator struct
	var validator configvalidator.ConfigValidator
	var result configvalidator.Result

	// Copying data into the format accepted by configvalidator package
	analyzersData := configvalidator.AnalyzersData{
		AnalyzerNames:      utils.AnaData.AnalyzerNames,
		AnalyzerShortcodes: utils.AnaData.AnalyzerShortcodes,
		AnalyzerMap:        utils.AnaData.AnalyzersMap,
		AnalyzesMeta:       utils.AnaData.AnalyzersMeta,
	}

	transformersData := configvalidator.TransformersData{
		TransformerNames:      utils.TrData.TransformerNames,
		TransformerShortcodes: utils.TrData.TransformerShortcodes,
		TransformerMap:        utils.TrData.TransformerMap,
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
