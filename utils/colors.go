package utils

import "github.com/fatih/color"

func Yellow(text string) string {
	c := color.New(color.FgYellow, color.Bold)
	return c.Sprint(text)
}

func Cyan(text string) string {
	c := color.New(color.FgCyan, color.Bold)
	return c.Sprint(text)
}
