package initialize

import (
	"bytes"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	validator "github.com/deepsourcelabs/cli/analyzers/validator"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/pelletier/go-toml"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

var SDKLanguageOpts = []string{"Python", "Go", "JavaScript"}

type SDKResponse struct {
	SDKRequired bool
	SDKLanguage string
}

type AnalyzerInitOpts struct {
	SDKInput              SDKResponse
	ProjectRootPath       string
	AnalyzerTOMLPath      string
	AnalyzerTOMLData      validator.AnalyzerMetadata
	IssuesDirectoryPath   string
	AnalyzerShortcodeArg  string
	SingleLineInputPrompt func(string, string, string) (string, error)
	DescriptionPrompt     func(string, string, string) (string, error)
	ConfirmationPrompt    func(string, string) (bool, error)
	SingleOptionPrompt    func(string, string, []string) (string, error)
}

func NewCmdAnalyzerInit() *cobra.Command {
	opts := AnalyzerInitOpts{
		SingleLineInputPrompt: utils.GetSingleLineInput,
		DescriptionPrompt:     utils.GetSingleLineInput,
		ConfirmationPrompt:    utils.ConfirmFromUser,
		SingleOptionPrompt:    utils.SelectFromOptions,
	}
	opts.ProjectRootPath, opts.AnalyzerTOMLPath, opts.IssuesDirectoryPath = utils.InitAnalyzerConfigurationPaths()
	cmd := &cobra.Command{
		Use:   "init",
		Short: "Initialize DeepSource Analyzer",
		Args:  utils.ExactArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			if len(args) > 0 {
				opts.AnalyzerShortcodeArg = args[0]
			}
			analysisConfigBytes, err := opts.initAnalyzer()
			if err != nil {
				return fmt.Errorf("Analyzer initialization failed. Error: %s", err)
			}
			if err = opts.writeConfig(analysisConfigBytes); err != nil {
				return fmt.Errorf("Analyzer initialization failed. Error: %s", err)
			}
			pterm.Success.Printf("Analyzer %s set up successfully!\n", opts.AnalyzerTOMLData.Shortcode)
			return nil
		},
	}
	return cmd
}

func (a *AnalyzerInitOpts) initAnalyzer() (*bytes.Buffer, error) {
	var err error
	var msg, helpText string
	pterm.Info.Printf("Initializing analyzer %s...\n", a.AnalyzerShortcodeArg)
	a.AnalyzerTOMLData.Shortcode = strings.ToLower(a.AnalyzerShortcodeArg)
	// Fetch the default analyzer name from the shortcode
	// Eg: @deepsource/armory -> Armory
	defaultAnalyzerName := strings.Title(strings.SplitAfter(a.AnalyzerTOMLData.Shortcode, "/")[1])

	// Collect name of the Analyzer
	msg = "Please enter the name of the Analyzer?"
	helpText = "The name of the Analyzer."
	a.AnalyzerTOMLData.Name, err = a.SingleLineInputPrompt(msg, helpText, defaultAnalyzerName)
	if err != nil {
		return nil, err
	}

	// Collect description of the Analyzer
	msg = "Description of the Analyzer?"
	helpText = "What does the Analyzer do?"
	a.AnalyzerTOMLData.Description, err = a.DescriptionPrompt(msg, helpText, "")
	if err != nil {
		return nil, err
	}

	// Check if DeepSource SDK is needed or not?
	msg = "Would you like to use DeepSource Analyzer SDK to build your Analyzer?"
	helpText = "DeepSource SDKs help you to easily create an Analyzer"
	a.SDKInput.SDKRequired, err = a.ConfirmationPrompt(msg, helpText)
	if err != nil {
		return nil, err
	}

	if a.SDKInput.SDKRequired {
		msg = "Which language do you want the SDK for:"
		helpText = "Choose the language for which the SDK will be generated"
		a.SDKInput.SDKLanguage, err = a.SingleOptionPrompt(msg, helpText, SDKLanguageOpts)
		if err != nil {
			return nil, err
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

func (a *AnalyzerInitOpts) writeConfig(buf *bytes.Buffer) (err error) {
	// Input complete. Start with generating analyzer.toml and issue descriptions.
	// Create the .deepsource/analyzer directory and issues/ directory
	directoriesToCreate := []string{".deepsource", ".deepsource/analyzer", ".deepsource/analyzer/issues/"}

	// Create the required directories mentioned above
	for _, dir := range directoriesToCreate {
		if _, err := os.Stat(filepath.Join(a.ProjectRootPath, dir)); errors.Is(err, os.ErrNotExist) {
			if err = os.Mkdir(filepath.Join(a.ProjectRootPath, dir), 0o755); err != nil {
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
