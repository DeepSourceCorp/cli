package utils

import (
	"errors"
	"strings"

	"github.com/AlecAivazis/survey/v2"
	"github.com/AlecAivazis/survey/v2/terminal"
	"github.com/morikuni/aec"
)

type UserInputPrompt struct{}

// ==========
// Useful APIs of survey library
// ==========

// Used for (Yes/No) questions
func (UserInputPrompt) ConfirmFromUser(msg, helpText string) (bool, error) {
	response := false
	confirmPrompt := &survey.Confirm{
		Renderer: survey.Renderer{},
		Message:  msg,
		Default:  true,
		Help:     helpText,
	}
	err := survey.AskOne(confirmPrompt, &response)
	if err != nil {
		return true, checkInterrupt(err)
	}
	return response, nil
}

// Used for Single Option Selection from Multiple Options
// Being used for selecting Java version for configuring meta of Java analyzer
// > * 1
//   * 2
//   * 3
func (UserInputPrompt) SelectFromOptions(msg, helpText string, opts []string) (string, error) {
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
		return "", checkInterrupt(err)
	}
	return strings.TrimSpace(result), nil
}

// Used for Single Line Text Input
// Being used for getting "Import root" of user for configuring meta of Go analyzer
func (UserInputPrompt) GetSingleLineInput(msg, helpText, defaultValue string) (string, error) {
	response := ""
	prompt := &survey.Input{
		Renderer: survey.Renderer{},
		Message:  msg,
		Default:  defaultValue,
		Help:     helpText,
	}

	err := survey.AskOne(prompt, &response)
	if err != nil {
		return "", checkInterrupt(err)
	}
	return strings.TrimSpace(response), nil
}

// Used for multiple inputs from the displayed options
// Example:
// ? Which languages/tools does your project use?
// > [ ]  Shell
//   [ ]  Rust
//   [ ]  Test Coverage
//   [ ]  Python
//   [ ]  Go
func (UserInputPrompt) SelectFromMultipleOptions(msg, helpText string, options []string) ([]string, error) {
	response := make([]string, 0)
	// Extracting languages and tools being used in the project for Analyzers
	analyzerPrompt := &survey.MultiSelect{
		Renderer: survey.Renderer{},
		Message:  msg,
		Options:  options,
		Help:     helpText,
	}
	err := survey.AskOne(analyzerPrompt, &response, survey.WithValidator(survey.Required))
	if err != nil {
		return nil, checkInterrupt(err)
	}
	return response, nil
}

// Utility to check for Ctrl+C interrupts
// Survey library doesn't exit on Ctrl+c interrupt. This handler helps in that.
func checkInterrupt(err error) error {
	if err == terminal.InterruptErr {
		return errors.New("Interrupt received. Exiting...")
	}
	return err
}

func GetSuccessMessage(msg string) string {
	greenTickMark := aec.Apply("[✔]", aec.LightGreenF)
	return greenTickMark + " " + msg
}

func GetFailureMessage(msg, errorMsg string) string {
	if errorMsg != "" {
		return aec.Apply("[✗]"+" "+msg+". "+"Error: "+errorMsg, aec.LightRedF)
	}
	return aec.Apply("[✗]"+" "+msg, aec.LightRedF)
}

func GetBulletMessage(msg, color string) string {
	switch color {
	case "red":
		return aec.Apply("•"+" "+msg, aec.LightRedF)
	}
	return ""
}
