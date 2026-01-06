package utils

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestYellow(t *testing.T) {
	t.Run("returns non-empty string", func(t *testing.T) {
		result := Yellow("test")
		assert.NotEmpty(t, result)
		assert.Contains(t, result, "test")
	})

	t.Run("works with empty string", func(t *testing.T) {
		result := Yellow("")
		assert.NotNil(t, result)
	})

	t.Run("works with special characters", func(t *testing.T) {
		result := Yellow("test!@#$%")
		assert.Contains(t, result, "test")
	})
}

func TestCyan(t *testing.T) {
	t.Run("returns non-empty string", func(t *testing.T) {
		result := Cyan("test")
		assert.NotEmpty(t, result)
		assert.Contains(t, result, "test")
	})

	t.Run("works with empty string", func(t *testing.T) {
		result := Cyan("")
		assert.NotNil(t, result)
	})

	t.Run("works with special characters", func(t *testing.T) {
		result := Cyan("test!@#$%")
		assert.Contains(t, result, "test")
	})
}
