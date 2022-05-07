package utils

import (
	"os"
	"sync"
	"time"

	"github.com/briandowns/spinner"
)

type SpinnerUtils struct {
	mu      sync.Mutex
	Spinner *spinner.Spinner
}

// Starts the spinner with the passed label. Final message is also set which is shown once the Spinner
// is stopped without an error.
func (s *SpinnerUtils) StartSpinnerWithLabel(label, finalMessage string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	sp := spinner.New(spinner.CharSets[11], 120*time.Millisecond, spinner.WithWriter(os.Stderr), spinner.WithFinalMSG(GetSuccessMessage(finalMessage))) // Build our new spinner
	if label != "" {
		sp.Suffix = " " + label + " "
	}

	sp.Start() // Start the spinner
	s.Spinner = sp
}

// Stops the spinner
func (s *SpinnerUtils) StopSpinner() {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.Spinner == nil {
		return
	}
	s.Spinner.Stop()
	s.Spinner = nil
}

// Stops the spinner and displays an error message with a cross emoji
func (s *SpinnerUtils) StopSpinnerWithError(msg string, errorMessage error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.Spinner.FinalMSG = GetFailureMessage(msg, errorMessage.Error())
	if s.Spinner == nil {
		return
	}
	s.Spinner.Stop()
	s.Spinner = nil
}
