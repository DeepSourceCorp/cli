package utils

import (
	"errors"
	"fmt"

	"github.com/spf13/cobra"
)

// Validates if the number of args passed to a command is exactly same as that required
func ExactArgs(count int) cobra.PositionalArgs {
	return func(cmd *cobra.Command, args []string) error {
		arg := "argument"
		if count > 1 {
			arg = "arguments"
		}

		errorMsg := fmt.Sprintf("`%s` requires exactly %d %s. Got %d. Please see `%s --help` for the supported flags and their usage.",
			cmd.CommandPath(),
			count,
			arg,
			len(args),
			cmd.CommandPath())

		if len(args) != count {
			return errors.New(errorMsg)
		}
		return nil
	}
}

func MaxNArgs(count int) cobra.PositionalArgs {
	return func(cmd *cobra.Command, args []string) error {
		arg := "argument"
		if count > 1 {
			arg = "arguments"
		}

		errorMsg := fmt.Sprintf("`%s` requires maximum %d %s. Got %d. Please see `%s --help` for the supported flags and their usage.",
			cmd.CommandPath(),
			count,
			arg,
			len(args),
			cmd.CommandPath())

		if len(args) > count {
			return errors.New(errorMsg)
		}
		return nil
	}
}

// Validates if there is any arg passed to a command which doesn't require any
func NoArgs(cmd *cobra.Command, args []string) error {
	errorMsg := fmt.Sprintf("`%s` does not require any argument. Please see `%s --help` for the supported flags and their usage.",
		cmd.CommandPath(),
		cmd.CommandPath())

	if len(args) > 0 {
		return errors.New(errorMsg)
	}
	return nil
}
