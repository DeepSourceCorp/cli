package utils

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestYellow(t *testing.T) {
	result := Yellow("test")
	assert.NotEmpty(t, result)
	assert.Contains(t, result, "test")
}

func TestCyan(t *testing.T) {
	result := Cyan("test")
	assert.NotEmpty(t, result)
	assert.Contains(t, result, "test")
}
