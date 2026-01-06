package utils

import (
	"errors"
	"sync"
	"testing"

	"github.com/AlecAivazis/survey/v2"
	"github.com/AlecAivazis/survey/v2/terminal"
	"github.com/stretchr/testify/assert"
)

var mockMu sync.Mutex

func TestCheckInterrupt(t *testing.T) {
	t.Run("interrupt error returns formatted message", func(t *testing.T) {
		result := checkInterrupt(terminal.InterruptErr)
		assert.Error(t, result)
		assert.Contains(t, result.Error(), "Interrupt received")
	})

	t.Run("other error is returned as-is", func(t *testing.T) {
		originalErr := errors.New("some other error")
		result := checkInterrupt(originalErr)
		assert.Equal(t, originalErr, result)
	})

	t.Run("nil error returns nil", func(t *testing.T) {
		result := checkInterrupt(nil)
		assert.Nil(t, result)
	})
}

func TestConfirmFromUser(t *testing.T) {
	t.Run("user confirms", func(t *testing.T) {
		mockMu.Lock()
		originalAskOne := surveyAskOne
		surveyAskOne = func(p survey.Prompt, response interface{}, opts ...survey.AskOpt) error {
			*(response.(*bool)) = true
			return nil
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			surveyAskOne = originalAskOne
			mockMu.Unlock()
		}()

		result, err := ConfirmFromUser("Test?", "Help text")
		assert.NoError(t, err)
		assert.True(t, result)
	})

	t.Run("user denies", func(t *testing.T) {
		mockMu.Lock()
		originalAskOne := surveyAskOne
		surveyAskOne = func(p survey.Prompt, response interface{}, opts ...survey.AskOpt) error {
			*(response.(*bool)) = false
			return nil
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			surveyAskOne = originalAskOne
			mockMu.Unlock()
		}()

		result, err := ConfirmFromUser("Test?", "Help text")
		assert.NoError(t, err)
		assert.False(t, result)
	})

	t.Run("interrupt returns error", func(t *testing.T) {
		mockMu.Lock()
		originalAskOne := surveyAskOne
		surveyAskOne = func(p survey.Prompt, response interface{}, opts ...survey.AskOpt) error {
			return terminal.InterruptErr
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			surveyAskOne = originalAskOne
			mockMu.Unlock()
		}()

		_, err := ConfirmFromUser("Test?", "Help text")
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "Interrupt")
	})

	t.Run("other error is propagated", func(t *testing.T) {
		mockMu.Lock()
		originalAskOne := surveyAskOne
		surveyAskOne = func(p survey.Prompt, response interface{}, opts ...survey.AskOpt) error {
			return errors.New("some error")
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			surveyAskOne = originalAskOne
			mockMu.Unlock()
		}()

		_, err := ConfirmFromUser("Test?", "Help text")
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "some error")
	})
}

func TestSelectFromOptions(t *testing.T) {
	t.Run("valid selection", func(t *testing.T) {
		mockMu.Lock()
		originalAskOne := surveyAskOne
		surveyAskOne = func(p survey.Prompt, response interface{}, opts ...survey.AskOpt) error {
			*(response.(*string)) = "option2"
			return nil
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			surveyAskOne = originalAskOne
			mockMu.Unlock()
		}()

		result, err := SelectFromOptions("Select one", "Help", []string{"option1", "option2", "option3"})
		assert.NoError(t, err)
		assert.Equal(t, "option2", result)
	})

	t.Run("interrupt returns error", func(t *testing.T) {
		mockMu.Lock()
		originalAskOne := surveyAskOne
		surveyAskOne = func(p survey.Prompt, response interface{}, opts ...survey.AskOpt) error {
			return terminal.InterruptErr
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			surveyAskOne = originalAskOne
			mockMu.Unlock()
		}()

		_, err := SelectFromOptions("Select one", "Help", []string{"option1", "option2"})
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "Interrupt")
	})

	t.Run("other error is propagated", func(t *testing.T) {
		mockMu.Lock()
		originalAskOne := surveyAskOne
		surveyAskOne = func(p survey.Prompt, response interface{}, opts ...survey.AskOpt) error {
			return errors.New("selection error")
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			surveyAskOne = originalAskOne
			mockMu.Unlock()
		}()

		_, err := SelectFromOptions("Select one", "Help", []string{"option1"})
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "selection error")
	})
}

func TestGetSingleLineInput(t *testing.T) {
	t.Run("valid input", func(t *testing.T) {
		mockMu.Lock()
		originalAskOne := surveyAskOne
		surveyAskOne = func(p survey.Prompt, response interface{}, opts ...survey.AskOpt) error {
			*(response.(*string)) = "user input"
			return nil
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			surveyAskOne = originalAskOne
			mockMu.Unlock()
		}()

		result, err := GetSingleLineInput("Enter value", "Help")
		assert.NoError(t, err)
		assert.Equal(t, "user input", result)
	})

	t.Run("empty input", func(t *testing.T) {
		mockMu.Lock()
		originalAskOne := surveyAskOne
		surveyAskOne = func(p survey.Prompt, response interface{}, opts ...survey.AskOpt) error {
			*(response.(*string)) = ""
			return nil
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			surveyAskOne = originalAskOne
			mockMu.Unlock()
		}()

		result, err := GetSingleLineInput("Enter value", "Help")
		assert.NoError(t, err)
		assert.Equal(t, "", result)
	})

	t.Run("interrupt returns error", func(t *testing.T) {
		mockMu.Lock()
		originalAskOne := surveyAskOne
		surveyAskOne = func(p survey.Prompt, response interface{}, opts ...survey.AskOpt) error {
			return terminal.InterruptErr
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			surveyAskOne = originalAskOne
			mockMu.Unlock()
		}()

		_, err := GetSingleLineInput("Enter value", "Help")
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "Interrupt")
	})
}

func TestSelectFromMultipleOptions(t *testing.T) {
	t.Run("valid multiple selection", func(t *testing.T) {
		mockMu.Lock()
		originalAskOne := surveyAskOne
		surveyAskOne = func(p survey.Prompt, response interface{}, opts ...survey.AskOpt) error {
			result := response.(*[]string)
			*result = []string{"option1", "option3"}
			return nil
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			surveyAskOne = originalAskOne
			mockMu.Unlock()
		}()

		result, err := SelectFromMultipleOptions("Select", "Help", []string{"option1", "option2", "option3"})
		assert.NoError(t, err)
		assert.Equal(t, []string{"option1", "option3"}, result)
	})

	t.Run("single selection", func(t *testing.T) {
		mockMu.Lock()
		originalAskOne := surveyAskOne
		surveyAskOne = func(p survey.Prompt, response interface{}, opts ...survey.AskOpt) error {
			result := response.(*[]string)
			*result = []string{"only_one"}
			return nil
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			surveyAskOne = originalAskOne
			mockMu.Unlock()
		}()

		result, err := SelectFromMultipleOptions("Select", "Help", []string{"only_one", "other"})
		assert.NoError(t, err)
		assert.Equal(t, []string{"only_one"}, result)
	})

	t.Run("interrupt returns error", func(t *testing.T) {
		mockMu.Lock()
		originalAskOne := surveyAskOne
		surveyAskOne = func(p survey.Prompt, response interface{}, opts ...survey.AskOpt) error {
			return terminal.InterruptErr
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			surveyAskOne = originalAskOne
			mockMu.Unlock()
		}()

		_, err := SelectFromMultipleOptions("Select", "Help", []string{"option1"})
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "Interrupt")
	})

	t.Run("other error is propagated", func(t *testing.T) {
		mockMu.Lock()
		originalAskOne := surveyAskOne
		surveyAskOne = func(p survey.Prompt, response interface{}, opts ...survey.AskOpt) error {
			return errors.New("multi-select error")
		}
		mockMu.Unlock()

		defer func() {
			mockMu.Lock()
			surveyAskOne = originalAskOne
			mockMu.Unlock()
		}()

		_, err := SelectFromMultipleOptions("Select", "Help", []string{"option1"})
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "multi-select error")
	})
}
