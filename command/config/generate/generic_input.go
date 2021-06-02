package generate

import (
	"os"
	"path/filepath"

	"github.com/AlecAivazis/survey/v2"
)

// ==========
// Exclude Patterns Prompt
// ==========
func (o *Options) collectExcludePatterns() error {

	excludePatternsMsg := "Would you like to add any exclude patterns?"
	helpMsg := "Glob patterns of files that should not be analyzed such as auto-generated files, migrations, compatibility files."

	response, err := confirmFromUser(excludePatternsMsg, helpMsg)
	if err != nil {
		return err
	}

	if response == true {

		// If yes, then start taking inputs for exclude patterns and keep confirming if
		// the user wants to add more patterns. As soon as the user enters "n",exit.
		for {
			var excludePattern string
			excludePatternsPrompt := &survey.Input{
				Renderer: survey.Renderer{},
				Message:  "Select exclude pattern",
				Help:     helpMsg,
				Suggest: func(toComplete string) []string {
					return getMatchingFiles(toComplete)
				},
			}
			err := survey.AskOne(excludePatternsPrompt, &excludePattern)
			if err != nil {
				checkInterrupt(err)
				return err
			}

			// Having taken the input, append the received pattern to Options struct
			o.ExcludePatterns = append(o.ExcludePatterns, excludePattern)

			// Confirm from the user if the user wants to add more exclude patterns
			// Iterating this until user says no
			response, err := confirmFromUser("Add more exclude patterns?", "")
			if err != nil {
				return err
			}
			if response == false {
				break
			}
		}
	}

	return nil
}

// ==========
// Test Patterns Prompt
// ==========
func (o *Options) collectTestPatterns() error {

	testPatternsMsg := "Would you like to add any test patterns?"
	helpMsg := "Glob patterns of the test files. This helps us reduce false positives."

	// Confirm from the user (y/N) if he/she wants to add test patterns
	response, err := confirmFromUser(testPatternsMsg, helpMsg)
	if err != nil {
		return err
	}

	if response == true {

		// If yes, then start taking inputs for test patterns and keep confirming if
		// the user wants to add more patterns. As soon as the user enters "n",exit.
		for {
			var testPattern string
			testPatternsPrompt := &survey.Input{
				Renderer: survey.Renderer{},
				Message:  "Select test pattern",
				Default:  "",
				Help:     helpMsg,
				Suggest: func(toComplete string) []string {
					return getMatchingFiles(toComplete)
				},
			}
			err := survey.AskOne(testPatternsPrompt, &testPattern)
			if err != nil {
				checkInterrupt(err)
				return err
			}

			// Having taken the input of exclude_patterns, append it to the Options struct
			o.TestPatterns = append(o.TestPatterns, testPattern)

			// Confirm from the user if the user wants to add more test patterns
			// Iterating this until user says no
			response, err := confirmFromUser("Add more test patterns?", "")
			if err != nil {
				return err
			}

			if response == false {
				break
			}
		}
	}

	return nil
}

// Receives a filepath and returns matching dirs and files
// Used for autocompleting input of "exclude_patterns" and "test_patterns"
func getMatchingFiles(path string) []string {

	// Geting matching dirs and files using glob
	files, _ := filepath.Glob(path + "*")

	cwd, _ := os.Getwd()
	// Iterating over files and appending "/" to directories
	for index, file := range files {
		fileInfo, _ := os.Stat(filepath.Join(cwd, file))
		if fileInfo.IsDir() {
			files[index] = files[index] + "/"
		}
	}
	return files
}
