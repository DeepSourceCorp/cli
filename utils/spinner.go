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

func (s *SpinnerUtils) StartSpinnerWithLabel(label string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	sp := spinner.New(spinner.CharSets[11], 120*time.Millisecond, spinner.WithWriter(os.Stderr)) // Build our new spinner
	if label != "" {
		sp.Suffix = " " + label + " "
	}
	sp.Start() // Start the spinner
	s.Spinner = sp
}

func (s *SpinnerUtils) StopSpinner() {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.Spinner == nil {
		return
	}
	s.Spinner.Stop()
	s.Spinner = nil
}
