package generate

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/AlecAivazis/survey/v2"
	"github.com/deepsourcelabs/cli/utils"
)

// ==========
// Exclude Patterns Input Prompt
// ==========
func (o *Options) collectExcludePatterns() error {
	excludePatternsMsg := "Would you like to add any exclude patterns?"
	helpMsg := "Glob patterns of files that should not be analyzed such as auto-generated files, migrations, compatibility files."

	// Confirm from the user if they want to add an exclude pattern
	response, err := utils.ConfirmFromUser(excludePatternsMsg, helpMsg)
	if err != nil {
		return err
	}

	// If yes, keep entering patterns until they input n/N
	if response == true {
		err := o.inputFilePatterns("exclude", "Select exclude pattern", helpMsg)
		if err != nil {
			return err
		}
	}
	return nil
}

// ==========
// Test Patterns Input Prompt
// ==========
func (o *Options) collectTestPatterns() error {
	testPatternsMsg := "Would you like to add any test patterns?"
	helpMsg := "Glob patterns of the test files. This helps us reduce false positives."

	// Confirm from the user (y/N) if he/she wants to add test patterns
	response, err := utils.ConfirmFromUser(testPatternsMsg, helpMsg)
	if err != nil {
		return err
	}

	// If yes, keep entering patterns until they input n/N
	if response == true {
		err := o.inputFilePatterns("test", "Select test pattern", helpMsg)
		if err != nil {
			return err
		}
	}
	return nil
}

// Single utility function to help in inputting test as well as exclude patterns
// Keeps asking user for pattern and then confirms if they want to add more patterns
// Exits when user enters No (n/N)
func (o *Options) inputFilePatterns(field, msg, helpMsg string) error {
	// Infinite loop to keep running until user wants to stop inputting
	for {
		var filePattern string

		// Input the pattern
		filePatternsPrompt := &survey.Input{
			Renderer: survey.Renderer{},
			Message:  msg,
			Default:  "",
			Help:     helpMsg,
			Suggest: func(toComplete string) []string {
				return getMatchingFiles(toComplete)
			},
		}
		err := survey.AskOne(filePatternsPrompt, &filePattern)
		if err != nil {
			return err
		}

		// Having taken the input of exclude_patterns/test_pattern, append it to the Options struct
		if field == "test" {
			o.TestPatterns = append(o.TestPatterns, filePattern)
		} else {
			o.ExcludePatterns = append(o.ExcludePatterns, filePattern)
		}

		// Confirm from the user if the user wants to add more patterns
		// Iterating this until user says no
		// Here field contains : "test"/"exclude" depending upon the invoking
		confirmationMsg := fmt.Sprintf("Add more %s patterns?", field)
		response, err := utils.ConfirmFromUser(confirmationMsg, "")
		if err != nil {
			return err
		}
		if !response {
			break
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
