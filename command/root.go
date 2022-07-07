package command

import (
	"log"
	"plugin"

	"github.com/deepsourcelabs/cli/command/auth"
	"github.com/deepsourcelabs/cli/command/config"
	"github.com/deepsourcelabs/cli/command/issues"
	"github.com/deepsourcelabs/cli/command/repo"
	"github.com/deepsourcelabs/cli/command/report"
	"github.com/deepsourcelabs/cli/command/version"
	"github.com/spf13/cobra"
)

var commands []*cobra.Command

func NewCmdRoot() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "deepsource <command> <subcommand> [flags]",
		Short: "DeepSource CLI",
		Long: `Welcome to DeepSource CLI
Now ship good code directly from the command line.

Login into DeepSource using the command : deepsource auth login`,
		SilenceErrors: true,
		SilenceUsage:  true,
	}

	analyzerCmd := GetCmd("deepsource.so", "NewCmdAnalyzer")

	// Child Commands
	commands = append(commands, version.NewCmdVersion(), config.NewCmdConfig(), auth.NewCmdAuth(), repo.NewCmdRepo(), issues.NewCmdIssues(), report.NewCmdReport())

	if analyzerCmd != nil {
		log.Println("couldn't find analyzer cmd")
		commands = append(commands, analyzerCmd)
	}

	cmd.AddCommand(commands...)

	return cmd
}

func GetCmd(pluginPath, cmdName string) *cobra.Command {
	p, err := plugin.Open(pluginPath)
	if err != nil {
		return nil
	}
	b, err := p.Lookup(cmdName)
	log.Printf("errb: %v\n", err)
	log.Printf("b: %v\n", b)
	if err != nil {
		return nil
	}
	f, err := p.Lookup(cmdName)
	log.Printf("f: %v\n", f)
	if err == nil {
		f.(func())()
	}

	return *b.(**cobra.Command)
}

func Execute() error {
	cmd := NewCmdRoot()
	return cmd.Execute()
}
