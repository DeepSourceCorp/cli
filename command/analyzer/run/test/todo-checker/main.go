package main

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"strings"
)

var (
	issues       []Diagnostic
	analysisConf *AnalysisConfig
	codePath     string = os.Getenv("CODE_PATH")
	toolboxPath  string = os.Getenv("TOOLBOX_PATH")
)

func main() {
	var err error

	cmd := exec.Command("ls", "-ltr")
	cmd.Dir = toolboxPath

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err = cmd.Run()
	outStr, _ := stdout.String(), stderr.String()
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(outStr)

	log.Println("Parsing analysis_config.json...")
	if analysisConf, err = readAnalysisConfig(); err != nil {
		log.Fatalln(err)
	}

	for _, path := range analysisConf.Files {
		content, err := ioutil.ReadFile(string(path.URI))
		if err != nil {
			log.Fatal(err)
		}
		lines := strings.Split(string(content), "\n")
		for lineNumber, line := range lines {
			if strings.Contains(line, "TODO") {
				createIssue(string(path.URI), lineNumber, 0)
			}
		}
	}
	macroAnalysisResult := prepareResult()

	if writeError := writeMacroResult(macroAnalysisResult); writeError != nil {
		log.Fatalln("Error occured while writing results:", writeError)
	}
}
