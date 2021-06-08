package cmdutils

import (
	"fmt"
	"os"

	"github.com/AlecAivazis/survey/v2"
	"github.com/AlecAivazis/survey/v2/terminal"
)

// ==========
// Useful APIs of survey library
// ==========

// Used for (Yes/No) questions
func ConfirmFromUser(msg string, helpText string) (bool, error) {

	response := false

	confirmPrompt := &survey.Confirm{
		Renderer: survey.Renderer{},
		Message:  msg,
		Default:  true,
		Help:     helpText,
	}

	err := survey.AskOne(confirmPrompt, &response)
	if err != nil {
		checkInterrupt(err)
		return false, err
	}

	return response, nil
}

// Used for Single Option Selection from Multiple Options
// Being used for selecting Java version for configuring meta of Java analyzer
// > * 1
//   * 2
//   * 3
func SelectFromOptions(msg string, helpText string, opts []string) (string, error) {
	var result string
	prompt := &survey.Select{
		Renderer: survey.Renderer{},
		Message:  msg,
		Options:  opts,
		Default:  nil,
		Help:     helpText,
	}
	err := survey.AskOne(prompt, &result)
	if err != nil {
		checkInterrupt(err)
		return "", err
	}
	return result, nil
}

// Used for Single Line Text Input
// Being used for getting "Import root" of user for configuring meta of Go analyzer
func GetSingleLineInput(msg string, helpText string) (string, error) {

	response := ""

	prompt := &survey.Input{
		Renderer: survey.Renderer{},
		Message:  msg,
		Default:  "",
		Help:     helpText,
	}

	err := survey.AskOne(prompt, &response)
	if err != nil {
		checkInterrupt(err)
		return "", err
	}

	return response, nil
}

// Utility to check for Ctrl+C interrupts
// Survey library doesn't exit on Ctrl+c interrupt. This handler helps in that.
func checkInterrupt(err error) {

	if err == terminal.InterruptErr {
		fmt.Println("\nInterrupt received. Exiting...")
		os.Exit(0)
	}
}
