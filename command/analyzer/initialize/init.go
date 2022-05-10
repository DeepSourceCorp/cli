package initialize

import (
	"bytes"
	"errors"
	"fmt"
	"os"
	"path/filepath"

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
	SDKInput             SDKResponse
	ProjectRootPath      string
	AnalyzerTOMLPath     string
	AnalyzerTOMLData     validator.AnalyzerMetadata
	IssuesDirectoryPath  string
	AnalyzerShortcodeArg string
}

func NewCmdAnalyzerInit() *cobra.Command {
	opts := AnalyzerInitOpts{}
	opts.ProjectRootPath, opts.AnalyzerTOMLPath, opts.IssuesDirectoryPath = utils.InitAnalyzerConfigurationPaths()
	cmd := &cobra.Command{
		Use:   "init",
		Short: "Initialize DeepSource Analyzer",
		Args:  utils.ExactArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			if len(args) > 0 {
				opts.AnalyzerShortcodeArg = args[0]
			}
			if err := opts.Run(); err != nil {
				return fmt.Errorf("Analyzer initialization failed. Error: %s", err)
			}
			return nil
		},
	}
	return cmd
}

func (a *AnalyzerInitOpts) Run() (err error) {
	var msg, helpText string
	pterm.Info.Printf("Initializing analyzer %s...\n", a.AnalyzerShortcodeArg)
	a.AnalyzerTOMLData.Shortcode = a.AnalyzerShortcodeArg

	// Collect name of the Analyzer
	msg = "Please enter the name of the Analyzer?"
	helpText = "The name of the Analyzer."
	a.AnalyzerTOMLData.Name, err = utils.GetSingleLineInput(msg, helpText)
	if err != nil {
		return err
	}

	// Collect description of the Analyzer
	msg = "Description of the Analyzer?"
	helpText = "What does the Analyzer do?"
	a.AnalyzerTOMLData.Description, err = utils.GetSingleLineInput(msg, helpText)
	if err != nil {
		return err
	}

	// Check if DeepSource SDK is needed or not?
	msg = "Would you like to use DeepSource Analyzer SDK to build your Analyzer?"
	helpText = "DeepSource SDKs help you to easily create an Analyzer"
	a.SDKInput.SDKRequired, err = utils.ConfirmFromUser(msg, helpText)
	if err != nil {
		return err
	}

	if a.SDKInput.SDKRequired {
		msg = "Which language do you want the SDK for:"
		helpText = "Choose the language for which the SDK will be generated"
		a.SDKInput.SDKLanguage, err = utils.SelectFromOptions(msg, helpText, SDKLanguageOpts)
		if err != nil {
			return err
		}
	}

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

	// Encoding the struct to TOML
	// and storing in GeneratedConfig of Options struct
	var buf bytes.Buffer
	if err = toml.NewEncoder(&buf).Order(toml.OrderPreserve).Encode(a.AnalyzerTOMLData); err != nil {
		return err
	}

	// Write the input data to analyzer.toml
	err = os.WriteFile(a.AnalyzerTOMLPath, buf.Bytes(), 0o644)
	if err != nil {
		return err
	}

	return nil
}
