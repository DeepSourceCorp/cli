package main

import (
	"fmt"
	"os"
	"runtime/debug"

	"github.com/deepsourcelabs/cli/pkg/cmd"
)

var Version = "development"

// Date is dynamically set at build time in the Makefile.
var Date = "YYYY-MM-DD" // YYYY-MM-DD

func main() {

	buildVersion, buildDate := getBuildInfo()

	err := cmd.Execute(buildVersion, buildDate)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func getBuildInfo() (string, string) {

	if info, ok := debug.ReadBuildInfo(); ok && info.Main.Version != "(devel)" {
		Version = info.Main.Version
	}

	return Version, Date
}
