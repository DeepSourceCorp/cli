package generate

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/AlecAivazis/survey/v2"
	"github.com/AlecAivazis/survey/v2/terminal"
)

// Collects user
func (o *Options) collectUserInput() {

	// TODO: Remove this hard coded data
	supportedAnalyzers := []string{"Python", "JavaScript", "Go", "Java (beta)", "Ruby", "Docker", "Terraform", "Secrets", "SQL", "Test-Coverage"}

	transformerMap := map[string][]string{
		"Python":     {"YAPF", "Black", "AutoPEP8"},
		"Go":         {"Gofmt"},
		"JavaScript": {"Prettier", "StandardJS"},
		"Java":       {"Google-Java-Format"},
		"Ruby":       {"StandardRB"},
	}

	// ==========
	// Analyzers Prompt
	// ==========
	analyzerPrompt := &survey.MultiSelect{
		Renderer: survey.Renderer{},
		Message:  "Which languages/tools does your project use?",
		Options:  supportedAnalyzers,
		Help:     "Analyzers will find issues in your code. Add an analyzer by selecting a language you've written your code in.",
		PageSize: 0,
		VimMode:  false,
	}
	err := survey.AskOne(analyzerPrompt, &o.ActivatedAnalyzers, survey.WithValidator(survey.Required))

	if err == terminal.InterruptErr {
		fmt.Println("Exiting...")
		os.Exit(0)
	} else if err != nil {
		fmt.Println("Error occured while generating config.")
		os.Exit(1)
	}

	// Extracting compulsary meta for Go and Java analyzers
	for _, analyzer := range o.ActivatedAnalyzers {
		if analyzer == "Go" {
			o.GoImportRoot = getSingleLineInput("Please input the \"import root\" for Go analyzer.", "The source code will be placed in $GOPATH/src/{import_root}. An example of import root is - github.com/spf13/viper")
		}
		if analyzer == "Java (beta)" {
			supportedJavaVersions := []string{"8", "9", "10", "11", "12", "13", "14", "15"}
			o.JavaVersion = getSingleOptionInput("Please input the JAVA version", "The version of Java runtime to use. OpenJDK versions 8 to 15 are supported.", supportedJavaVersions)
		}
	}

	// ==========
	// Transformers Prompt
	// ==========

	// Transformers for selected analyzers
	for _, selectedAnalyzer := range o.ActivatedAnalyzers {
		transformerOpts, ok := transformerMap[selectedAnalyzer]
		if !ok {
			continue
		}
		transformerQues := fmt.Sprintf("Which transformers would you like to activate for %s?", selectedAnalyzer)

		transformerPrompt := &survey.MultiSelect{
			Renderer: survey.Renderer{},
			Message:  transformerQues,
			Options:  transformerOpts,
			Help:     "DeepSource Transformers automatically help to achieve auto-formatting of code. Add a transformer by selecting the code formatting tool of your choice.",
			VimMode:  false,
		}
		err := survey.AskOne(transformerPrompt, &o.ActivatedTransformers)
		if err == terminal.InterruptErr {
			fmt.Println("Exiting...")
			os.Exit(0)
		} else if err != nil {
			fmt.Println("Error occured while generating config.")
			os.Exit(1)
		}
	}

	var remainingTransformerOpts []string
	// Any other Transformer that user would like to activate
	for _, analyzer := range supportedAnalyzers {
		alreadySelected := false
		for _, selectedAnalyzer := range o.ActivatedAnalyzers {

			// Not asking for selected analyzers again
			if analyzer == selectedAnalyzer {
				alreadySelected = true
				break
			}
		}

		if alreadySelected == false {
			transformers, ok := transformerMap[analyzer]
			if ok {
				for _, transformer := range transformers {
					remainingTransformerOpts = append(remainingTransformerOpts, fmt.Sprintf("%s (%s)", transformer, analyzer))
				}
			}
		}
	}

	transformerQues := fmt.Sprintf("Would you like to activate any transformers for other languages?")

	transformerPrompt := &survey.MultiSelect{
		Renderer: survey.Renderer{},
		Message:  transformerQues,
		Options:  remainingTransformerOpts,
		Help:     "DeepSource Transformers automatically help to achieve auto-formatting of code. Add a transformer by selecting the code formatting tool of your choice.",
		VimMode:  false,
	}

	err = survey.AskOne(transformerPrompt, &o.ActivatedTransformers)
	if err == terminal.InterruptErr {
		fmt.Println("Exiting...")
		os.Exit(0)
	} else if err != nil {
		fmt.Println("Error occured while generating config.")
		os.Exit(1)
	}

	// ==========
	// Exclude Patterns Confirmation Prompt
	// ==========

	response := confirmFromUser("Would you like to add any exclude patterns?", "Glob patterns of files that should not be analyzed such as auto-generated files, migrations, compatibility files.")

	// ==========
	// Exclude Patterns Selection Prompt
	// ==========

	if response == true {

		for {
			// Get Exclude Patterns
			var excludePattern string
			excludePatternsPrompt := &survey.Input{
				Renderer: survey.Renderer{},
				Message:  "Select exclude pattern",
				Default:  "",
				Help:     "",
				Suggest: func(toComplete string) []string {
					files, _ := filepath.Glob(toComplete + "**")
					return files
				},
			}
			err := survey.AskOne(excludePatternsPrompt, &excludePattern)
			if err == terminal.InterruptErr {
				fmt.Println("Exiting...")
				os.Exit(0)
			} else if err != nil {
				fmt.Println("Error occured while generating config.")
				os.Exit(1)
			}

			o.ExcludePatterns = append(o.ExcludePatterns, excludePattern)

			response := confirmFromUser("Add more exclude patterns?", "")
			if response == false {
				break
			}
		}
	}

	// ==========
	// Test Patterns Confirmation Prompt
	// ==========
	response = confirmFromUser("Would you like to add any test patterns?", "Glob patterns of the test files. This helps us reduce false positives.")

	// ==========
	// Exclude Patterns Selection Prompt
	// ==========
	if response == true {

		for {
			// Get Exclude Patterns
			var testPattern string
			testPatternsPrompt := &survey.Input{
				Renderer: survey.Renderer{},
				Message:  "Select test pattern",
				Default:  "",
				Help:     "",
				Suggest: func(toComplete string) []string {
					files, _ := filepath.Glob(toComplete + "**")
					return files
				},
			}
			err := survey.AskOne(testPatternsPrompt, &testPattern)
			if err == terminal.InterruptErr {
				fmt.Println("Exiting...")
				os.Exit(0)
			} else if err != nil {
				fmt.Println("Error occured while generating config.")
				os.Exit(1)
			}

			o.ExcludePatterns = append(o.ExcludePatterns, testPattern)

			response := confirmFromUser("Add more test patterns?", "")
			if response == false {
				break
			}
		}
	}

}

func confirmFromUser(msg string, helpText string) bool {

	response := false
	confirmPrompt := &survey.Confirm{
		Renderer: survey.Renderer{},
		Message:  msg,
		Default:  true,
		Help:     helpText,
	}
	err := survey.AskOne(confirmPrompt, &response)

	if err == terminal.InterruptErr {
		fmt.Println("Exiting...")
		os.Exit(0)
	} else if err != nil {
		fmt.Println("Error occured while generating config.")
		os.Exit(1)
	}
	return response
}

func getSingleLineInput(msg string, helpText string) string {
	response := ""
	prompt := &survey.Input{
		Renderer: survey.Renderer{},
		Message:  msg,
		Default:  "",
		Help:     helpText,
	}
	err := survey.AskOne(prompt, &response)
	if err == terminal.InterruptErr {
		fmt.Println("Exiting...")
		os.Exit(0)
	} else if err != nil {
		fmt.Println("Error occured while generating config.")
		os.Exit(1)
	}
	return response
}

func getSingleOptionInput(msg string, helpText string, opts []string) string {
	response := ""
	prompt := &survey.Select{
		Renderer: survey.Renderer{},
		Message:  msg,
		Options:  opts,
		Default:  nil,
		Help:     helpText,
	}
	err := survey.AskOne(prompt, &response)

	if err == terminal.InterruptErr {
		fmt.Println("Exiting...")
		os.Exit(0)
	} else if err != nil {
		fmt.Println("Error occured while generating config.")
		os.Exit(1)
	}
	return response
}
