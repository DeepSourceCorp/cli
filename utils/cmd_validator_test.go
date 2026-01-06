package utils

import (
	"testing"

	"github.com/spf13/cobra"
	"github.com/stretchr/testify/assert"
)

func TestExactArgs(t *testing.T) {
	tests := []struct {
		name        string
		count       int
		args        []string
		expectError bool
	}{
		{
			name:        "exact match single arg",
			count:       1,
			args:        []string{"arg1"},
			expectError: false,
		},
		{
			name:        "exact match multiple args",
			count:       3,
			args:        []string{"a", "b", "c"},
			expectError: false,
		},
		{
			name:        "too few args",
			count:       2,
			args:        []string{"a"},
			expectError: true,
		},
		{
			name:        "too many args",
			count:       1,
			args:        []string{"a", "b"},
			expectError: true,
		},
		{
			name:        "zero args required and provided",
			count:       0,
			args:        []string{},
			expectError: false,
		},
		{
			name:        "zero args required but some provided",
			count:       0,
			args:        []string{"unexpected"},
			expectError: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			tc := tc
			cmd := &cobra.Command{Use: "test"}
			validator := ExactArgs(tc.count)
			err := validator(cmd, tc.args)

			if tc.expectError {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), "requires exactly")
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestExactArgs_ErrorMessage(t *testing.T) {
	t.Run("singular argument in message", func(t *testing.T) {
		cmd := &cobra.Command{Use: "test"}
		validator := ExactArgs(1)
		err := validator(cmd, []string{})

		assert.Error(t, err)
		assert.Contains(t, err.Error(), "1 argument")
		assert.NotContains(t, err.Error(), "arguments")
	})

	t.Run("plural arguments in message", func(t *testing.T) {
		cmd := &cobra.Command{Use: "test"}
		validator := ExactArgs(2)
		err := validator(cmd, []string{})

		assert.Error(t, err)
		assert.Contains(t, err.Error(), "2 arguments")
	})

	t.Run("includes command path in message", func(t *testing.T) {
		cmd := &cobra.Command{Use: "mycommand"}
		validator := ExactArgs(1)
		err := validator(cmd, []string{})

		assert.Error(t, err)
		assert.Contains(t, err.Error(), "mycommand")
		assert.Contains(t, err.Error(), "--help")
	})
}

func TestMaxNArgs(t *testing.T) {
	tests := []struct {
		name        string
		max         int
		args        []string
		expectError bool
	}{
		{
			name:        "within limit",
			max:         3,
			args:        []string{"a", "b"},
			expectError: false,
		},
		{
			name:        "at limit",
			max:         2,
			args:        []string{"a", "b"},
			expectError: false,
		},
		{
			name:        "over limit",
			max:         1,
			args:        []string{"a", "b"},
			expectError: true,
		},
		{
			name:        "zero args provided",
			max:         2,
			args:        []string{},
			expectError: false,
		},
		{
			name:        "max zero with args",
			max:         0,
			args:        []string{"a"},
			expectError: true,
		},
		{
			name:        "max zero no args",
			max:         0,
			args:        []string{},
			expectError: false,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			cmd := &cobra.Command{Use: "test"}
			validator := MaxNArgs(tc.max)
			err := validator(cmd, tc.args)

			if tc.expectError {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), "requires maximum")
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestMaxNArgs_ErrorMessage(t *testing.T) {
	t.Run("singular argument in message", func(t *testing.T) {
		cmd := &cobra.Command{Use: "test"}
		validator := MaxNArgs(1)
		err := validator(cmd, []string{"a", "b"})

		assert.Error(t, err)
		assert.Contains(t, err.Error(), "1 argument")
		assert.NotContains(t, err.Error(), "arguments")
	})

	t.Run("plural arguments in message", func(t *testing.T) {
		cmd := &cobra.Command{Use: "test"}
		validator := MaxNArgs(2)
		err := validator(cmd, []string{"a", "b", "c"})

		assert.Error(t, err)
		assert.Contains(t, err.Error(), "2 arguments")
	})

	t.Run("includes command path in message", func(t *testing.T) {
		cmd := &cobra.Command{Use: "mycommand"}
		validator := MaxNArgs(1)
		err := validator(cmd, []string{"a", "b"})

		assert.Error(t, err)
		assert.Contains(t, err.Error(), "mycommand")
		assert.Contains(t, err.Error(), "--help")
	})
}

func TestNoArgs(t *testing.T) {
	tests := []struct {
		name        string
		args        []string
		expectError bool
	}{
		{
			name:        "no args provided",
			args:        []string{},
			expectError: false,
		},
		{
			name:        "one arg provided",
			args:        []string{"arg"},
			expectError: true,
		},
		{
			name:        "multiple args provided",
			args:        []string{"a", "b", "c"},
			expectError: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			tc := tc
			cmd := &cobra.Command{Use: "test"}
			err := NoArgs(cmd, tc.args)

			if tc.expectError {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), "does not require any argument")
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestNoArgs_ErrorMessage(t *testing.T) {
	t.Run("includes command path in message", func(t *testing.T) {
		cmd := &cobra.Command{Use: "mycommand"}
		err := NoArgs(cmd, []string{"unexpected"})

		assert.Error(t, err)
		assert.Contains(t, err.Error(), "mycommand")
		assert.Contains(t, err.Error(), "--help")
	})
}
