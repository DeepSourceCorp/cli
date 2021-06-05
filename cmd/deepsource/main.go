package main

import (
	"log"

	"github.com/deepsourcelabs/cli/command"
	"github.com/deepsourcelabs/cli/version"
)

var (
	// Version is the build version.  This is set using ldflags -X
	Version = "development"

	// Date is the build date.  This is set using ldflags -X
	Date = "YYYY-MM-DD" // YYYY-MM-DD
)

func main() {

	// code := mainRun()
	// os.Exit(int(code))

	version.SetBuildInfo(Version, Date, "", "")

	if err := command.Execute(); err != nil {
		log.Fatal(err)
	}
}
