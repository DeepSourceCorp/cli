package main

import (
	"log"
	"os"

	"github.com/deepsourcelabs/cli/command"
	"github.com/deepsourcelabs/cli/version"
	"github.com/pterm/pterm"
)

var (
	// Version is the build version.  This is set using ldflags -X
	Version = "development"

	// Date is the build date.  This is set using ldflags -X
	Date = "YYYY-MM-DD" // YYYY-MM-DD
)

func main() {

	log.SetFlags(log.LstdFlags | log.Lshortfile)
	// code := mainRun()
	// os.Exit(int(code))

	version.SetBuildInfo(Version, Date, "", "")

	if err := command.Execute(); err != nil {
		pterm.Error.Println(err)
		os.Exit(1)
	}
}
