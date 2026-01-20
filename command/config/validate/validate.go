package validate

import (
	"context"
	"errors"
	"fmt"
	"io/ioutil"
	"strconv"
	"strings"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/internal/cli/args"
	"github.com/deepsourcelabs/cli/internal/configvalidator"
	configsvc "github.com/deepsourcelabs/cli/internal/services/config"
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

	// Just an info
	pterm.Println("DeepSource config (.deepsource.toml) is mostly present in the root directory of the project.")
	fmt.Println()

	// Extract the path of DeepSource config
	configPath, err := svc.FindConfigPath()
	if err != nil {
		return err
	}

	// Read the config in the form of string and send it
	content, err := ioutil.ReadFile(configPath)
	if err != nil {
		return errors.New("Error occured while reading DeepSource config file. Exiting...")
	}

	// Fetch the client
	ctx := context.Background()
	// Fetch the list of supported analyzers and transformers' data
	// using the SDK
	err = svc.FetchAnalyzersAndTransformersData(ctx, cfg)
	if err != nil {
		return err
	}

	// Create an instance of ConfigValidator struct
	var validator configvalidator.ConfigValidator
	// Send the config contents to get validated
	var result configvalidator.Result = validator.ValidateConfig(content)

	// Checking for all types of errors (due to viper/valid errors/no errors)
	// and handling them
	if result.ConfigReadError {
		// handle printing viper error here
		printViperError(content, result.Errors)
	} else if !result.Valid {
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
