package utils

import "github.com/fatih/color"

func Yellow(format string, a ...interface{}) string {
	c := color.New(color.FgYellow, color.Bold)
	
	return c.Sprintf(format, a...)
}

func Cyan(format string, a ...interface{}) string {
	c := color.New(color.FgCyan, color.Bold)
	return c.Sprintf(format, a...)
}
