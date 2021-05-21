package main

import (
	"log"
	"runtime/debug"

	"github.com/deepsourcelabs/cli/pkg/cmd"
)

func main() {
	buildVersion, buildDate := getBuildInfo()

	cmd.Execute(buildVersion, buildDate)
}

func getBuildInfo() (string, string) {

	var Version = "TEST"

	// Date is dynamically set at build time in the Makefile.
	var Date = "" // YYYY-MM-DD

	info, ok := debug.ReadBuildInfo()
	if ok {
		log.Println(info)
	}

	//  if info, ok := debug.ReadBuildInfo(); ok && info.Main.Version != "(devel)" {
	// Version = info.Main.Version
	//  }

	log.Println(Version, Date)

	return Version, Date
}
