package initialize

import (
	"bytes"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/pelletier/go-toml"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"

	"github.com/deepsourcelabs/cli/analyzers/config"
	"github.com/deepsourcelabs/cli/types"
	"github.com/deepsourcelabs/cli/utils"
)

type SDKResponse struct {
	SDKRequired bool
	SDKLanguage string
}

type AnalyzerInitOpts struct {
	SDKInput             SDKResponse
	ProjectRootPath      string
	AnalyzerTOMLPath     string
	IssuesDirectoryPath  string
	AnalyzerShortcodeArg string
	AnalyzerTOMLData     types.AnalyzerTOML

	ConfirmationPrompt    func(string, string) (bool, error)
	SingleLineInputPrompt func(string, string, string) (string, error)
	DescriptionPrompt     func(string, string, string) (string, error)
	SingleOptionPrompt    func(string, string, []string) (string, error)
}

func NewCmdAnalyzerInit() *cobra.Command {
	cwd, _ := os.Getwd()
	opts := AnalyzerInitOpts{
		SingleLineInputPrompt: utils.GetSingleLineInput,
		DescriptionPrompt:     utils.GetSingleLineInput,
		ConfirmationPrompt:    utils.ConfirmFromUser,
		SingleOptionPrompt:    utils.SelectFromOptions,
	}

	// Fetch the project root path and analyzer.toml path
	opts.ProjectRootPath, opts.AnalyzerTOMLPath, opts.IssuesDirectoryPath = config.InitAnalyzerConfigurationPaths()

	cmd := &cobra.Command{
		Use:   "init",
		Short: "Initialize DeepSource Analyzer",
		Args:  utils.ExactArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			// Check if the analyzer.toml already exists. If yes, display that the analyzer already initialized at `.deepsource/analyzer/analyzer.toml`
			if _, err := os.Stat(opts.AnalyzerTOMLPath); err == nil {
				pterm.Info.Printf("Analyzer already initialized at %s. Exiting...\n", strings.TrimPrefix(opts.AnalyzerTOMLPath, cwd+"/"))
				return nil
			}

			if len(args) > 0 {
				opts.AnalyzerShortcodeArg = args[0]
			}
			analysisConfigBytes, err := opts.initAnalyzer()
			if err != nil {
				return fmt.Errorf("Analyzer initialization failed. Error: %s", err)
			}
			if err = opts.writeAnalyzerTOMLConfig(analysisConfigBytes); err != nil {
				return fmt.Errorf("Analyzer initialization failed. Error: %s", err)
			}
			pterm.Success.Printf("Analyzer %s set up successfully!\n", opts.AnalyzerTOMLData.Shortcode)
			return nil
		},
	}
	return cmd
}

// Initialize the Analyzer
func (a *AnalyzerInitOpts) initAnalyzer() (*bytes.Buffer, error) {
	var err error
	var msg, helpText string
	supportedSDKS := getSupportedSDKs()

	pterm.Info.Printf("Initializing analyzer %s...\n", a.AnalyzerShortcodeArg)
	a.AnalyzerTOMLData.Shortcode = strings.ToLower(a.AnalyzerShortcodeArg)

	// Fetch the default analyzer name from the shortcode
	// Eg: @deepsource/armory -> Armory
	defaultAnalyzerName := strings.Title(strings.SplitAfter(a.AnalyzerTOMLData.Shortcode, "/")[1]) // skipcq: SCC-SA1019

	// Collect name of the Analyzer
	msg = "Please enter the name of the Analyzer?"
	helpText = "The name of the Analyzer."
	if a.AnalyzerTOMLData.Name, err = a.SingleLineInputPrompt(msg, helpText, defaultAnalyzerName); err != nil {
		return nil, err
	}

	// Collect description of the Analyzer
	msg = "Description of the Analyzer?"
	helpText = "What does the Analyzer do?"
	if a.AnalyzerTOMLData.Description, err = a.DescriptionPrompt(msg, helpText, ""); err != nil {
		return nil, err
	}

	// Tags for the analyzer
	msg = "Tags for the analyzer"
	helpText = "Some keywords related to the analyzer"
	analyzerTags, err := a.DescriptionPrompt(msg, helpText, "")
	if err != nil {
		return nil, err
	}
	// Parse tags from the user input
	a.AnalyzerTOMLData.Tags = processAnalyzerTags(analyzerTags)

	// Collect the repository of the Analyzer
	defaultRemoteURL, err := fetchRemoteURL()
	if err != nil || strings.HasPrefix(defaultRemoteURL, "git@") {
		defaultRemoteURL = ""
	}
	msg = "The git repository URL of the Analyzer?"
	helpText = "The remote repository URL of the Analyzer."
	if a.AnalyzerTOMLData.Repository, err = a.SingleLineInputPrompt(msg, helpText, strings.TrimRight(defaultRemoteURL, "\n")); err != nil {
		return nil, err
	}

	// Collect the analysis command of the Analyzer
	msg = "The analysis command for the Analyzer"
	helpText = "The command used to execute the Analyzer"
	if a.AnalyzerTOMLData.Analysis.Command, err = a.SingleLineInputPrompt(msg, helpText, ""); err != nil {
		return nil, err
	}

	// Collect the test command of the Analyzer
	msg = "The test command for the Analyzer"
	helpText = "The command used to run tests on the Analyzer"
	if a.AnalyzerTOMLData.Test.Command, err = a.SingleLineInputPrompt(msg, helpText, ""); err != nil {
		return nil, err
	}

	// Get SDKs input
	if len(supportedSDKS) > 0 {
		// Check if DeepSource SDK is needed or not?
		msg = "Would you like to use DeepSource Analyzer SDK to build your Analyzer?"
		helpText = "DeepSource SDKs help you to easily create an Analyzer"
		if a.SDKInput.SDKRequired, err = a.ConfirmationPrompt(msg, helpText); err != nil {
			return nil, err
		}

		if a.SDKInput.SDKRequired {
			msg = "Which language do you want the SDK for:"
			helpText = "Choose the language for which the SDK will be generated"
			if a.SDKInput.SDKLanguage, err = a.SingleOptionPrompt(msg, helpText, supportedSDKS); err != nil {
				return nil, err
			}
		}
	}

	// Encoding the struct to TOML
	// and storing in GeneratedConfig of Options struct
	var buf bytes.Buffer
	if err = toml.NewEncoder(&buf).Order(toml.OrderPreserve).Encode(a.AnalyzerTOMLData); err != nil {
		return nil, err
	}

	return &buf, nil
}

// Writes the Analyzer TOML data to the file
func (a *AnalyzerInitOpts) writeAnalyzerTOMLConfig(buf *bytes.Buffer) (err error) {
	// Create the .deepsource/analyzer directory and issues/ directory
	directoriesToCreate := []string{".deepsource", ".deepsource/analyzer", ".deepsource/analyzer/issues/"}

	// Create the required directories mentioned above
	for _, dir := range directoriesToCreate {
		if _, err := os.Stat(filepath.Join(a.ProjectRootPath, dir)); errors.Is(err, os.ErrNotExist) {
			if err = os.Mkdir(filepath.Join(a.ProjectRootPath, dir), 0o750); err != nil {
				return err
			}
		}
	}

	// Write the input data to analyzer.toml
	if err = os.WriteFile(a.AnalyzerTOMLPath, buf.Bytes(), 0o644); err != nil {
		return err
	}
	return
}