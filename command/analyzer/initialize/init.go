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

type InputPrompt interface {
	ConfirmFromUser(string, string) (bool, error)
	GetSingleLineInput(string, string, string) (string, error)
	SelectFromOptions(string, string, []string) (string, error)
}

type AnalyzerInitOpts struct {
	Namespace            string
	SDKInput             SDKResponse
	ProjectRootPath      string
	AnalyzerTOMLPath     string
	IssuesDirectoryPath  string
	AnalyzerShortcodeArg string
	AnalyzerTOMLData     types.AnalyzerTOML
	PromptUtils          InputPrompt
}

/* =============================================================
 * $ deepsource analyzer init
 *
 * Helps in initializing the config for a new DeepSource Analyzer
 * ============================================================== */
func NewCmdAnalyzerInit() *cobra.Command {
	cwd, _ := os.Getwd()

	opts := AnalyzerInitOpts{
		PromptUtils:          utils.UserInputPrompt{},
		AnalyzerShortcodeArg: "",
	}

	// Fetch the project root path and analyzer.toml path
	opts.ProjectRootPath, opts.AnalyzerTOMLPath, opts.IssuesDirectoryPath = config.InitAnalyzerConfigurationPaths()

	cmd := &cobra.Command{
		Use:   "init",
		Short: "Initialize DeepSource Analyzer",
		Args:  utils.MaxNArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			// Check if the analyzer.toml already exists.
			// If yes, display that the analyzer already initialized at `.deepsource/analyzer/analyzer.toml`
			if _, err := os.Stat(opts.AnalyzerTOMLPath); err == nil {
				pterm.Info.Printf("Analyzer already initialized at %s. Exiting...\n", strings.TrimPrefix(opts.AnalyzerTOMLPath, cwd+"/"))
				return nil
			}

			// Check for the shortcode argument (if any)
			if len(args) > 0 {
				opts.AnalyzerShortcodeArg = args[0]
				if !strings.HasPrefix(opts.AnalyzerShortcodeArg, "@") {
					opts.AnalyzerShortcodeArg = strings.ToLower("@" + opts.AnalyzerShortcodeArg)
				}
			}

			analysisConfigBytes, err := opts.initAnalyzer()
			if err != nil {
				return fmt.Errorf("Analyzer initialization failed. Error: %s", err)
			}
			if err = opts.writeAnalyzerTOMLConfig(analysisConfigBytes); err != nil {
				return fmt.Errorf("Analyzer initialization failed. Error: %s", err)
			}
			pterm.Success.Printf("Analyzer %s initialized successfully!\n", opts.AnalyzerTOMLData.Shortcode)
			return nil
		},
	}
	return cmd
}

// initAnalyzer helps the Analyzer authors initialize a new Analyzer
// in an interactive way with the help of suitable prompts
func (a *AnalyzerInitOpts) initAnalyzer() (*bytes.Buffer, error) {
	var err error
	var msg, helpText string

	if a.AnalyzerShortcodeArg == "" {
		// Input namespace which the Analyzer will belong to.
		// TODO(SNT): Change this to use a public API to show a list of namespaces the user has access to.
		msg = "Namespace"
		helpText = "The namespace to which the Analyzer will be associated."
		if a.Namespace, err = a.PromptUtils.GetSingleLineInput(msg, helpText, ""); err != nil {
			return nil, err
		}
		// Check for empty namespace and return error
		if a.Namespace == "" {
			return nil, fmt.Errorf("namespace cannot be empty")
		}

		// Input shortcode of the Analyzer
		msg = "Analyzer shortcode"
		helpText = "Shortcode of the Analyzer. This is to be used to access the Analyzer."
		if a.AnalyzerTOMLData.Shortcode, err = a.PromptUtils.GetSingleLineInput(msg, helpText, ""); err != nil {
			return nil, err
		}
		// Check for empty shortcode and return error
		if a.AnalyzerTOMLData.Shortcode == "" {
			return nil, fmt.Errorf("Analyzer shortcode cannot be empty")
		}
		a.AnalyzerShortcodeArg = strings.ToLower("@" + a.Namespace + "/" + a.AnalyzerTOMLData.Shortcode)
	}

	pterm.Info.Printf("Initializing analyzer %s...\n", a.AnalyzerShortcodeArg)
	a.AnalyzerTOMLData.Shortcode = strings.ToLower(a.AnalyzerShortcodeArg)

	// Fetch the default analyzer name from the shortcode
	// Eg: @deepsource/armory -> Armory
	defaultAnalyzerName := strings.Title(strings.SplitAfter(a.AnalyzerTOMLData.Shortcode, "/")[1]) // skipcq: SCC-SA1019

	// Collect name of the Analyzer
	msg = "Display name of the Analyzer"
	helpText = "The name of the Analyzer which will be displayed on the dashboard."
	if a.AnalyzerTOMLData.Name, err = a.PromptUtils.GetSingleLineInput(msg, helpText, defaultAnalyzerName); err != nil {
		return nil, err
	}

	// Collect description of the Analyzer
	msg = "Description of the Analyzer"
	helpText = "Explain what the Analyzer does and the kinds of issues it detects."
	if a.AnalyzerTOMLData.Description, err = a.PromptUtils.GetSingleLineInput(msg, helpText, ""); err != nil {
		return nil, err
	}

	// Tags for the analyzer
	msg = "Tags for the Analyzer (comma or space separated)"
	helpText = "Some keywords related to the Analyzer. Use commas/spaces to separate the keywords."
	analyzerTags, err := a.PromptUtils.GetSingleLineInput(msg, helpText, "")
	if err != nil {
		return nil, err
	}
	// Parse tags from the user input
	a.AnalyzerTOMLData.Tags = processAnalyzerTags(analyzerTags)

	// Collect the repository of the Analyzer
	defaultRemoteURL, err := fetchRemoteURL()
	if err != nil {
		defaultRemoteURL = ""
	}
	msg = "Git repository URL of the Analyzer?"
	helpText = "The remote repository URL of the Analyzer."
	if a.AnalyzerTOMLData.Repository, err = a.PromptUtils.GetSingleLineInput(msg, helpText, strings.TrimRight(defaultRemoteURL, "\n")); err != nil {
		return nil, err
	}

	// Collect the analysis command of the Analyzer
	msg = "Analysis command for the Analyzer"
	helpText = "The command used to execute the Analyzer"
	if a.AnalyzerTOMLData.Analysis.Command, err = a.PromptUtils.GetSingleLineInput(msg, helpText, ""); err != nil {
		return nil, err
	}

	// Collect the test command of the Analyzer
	msg = "Test command for the Analyzer"
	helpText = "The command used to run tests on the Analyzer"
	if a.AnalyzerTOMLData.Test.Command, err = a.PromptUtils.GetSingleLineInput(msg, helpText, ""); err != nil {
		return nil, err
	}

	// Get SDKs input
	supportedSDKS := getSupportedSDKs()
	if len(supportedSDKS) > 0 {
		// Check if DeepSource SDK is needed or not?
		msg = "Would you like to use DeepSource Analyzer SDK to build your Analyzer?"
		helpText = "DeepSource SDKs help you to easily create an Analyzer"
		if a.SDKInput.SDKRequired, err = a.PromptUtils.ConfirmFromUser(msg, helpText); err != nil {
			return nil, err
		}

		if a.SDKInput.SDKRequired {
			msg = "Which language do you want the SDK for:"
			helpText = "Choose the language for which the SDK will be generated"
			if a.SDKInput.SDKLanguage, err = a.PromptUtils.SelectFromOptions(msg, helpText, supportedSDKS); err != nil {
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
