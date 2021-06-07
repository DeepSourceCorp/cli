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

// Utility to check for Ctrl+C interrupts
// Survey library doesn't exit on Ctrl+c interrupt. This handler helps in that.
func checkInterrupt(err error) {

	if err == terminal.InterruptErr {
		fmt.Println("\nInterrupt received. Exiting...")
		os.Exit(0)
	}
}
