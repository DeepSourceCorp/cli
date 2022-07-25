package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path"
	"strings"
)

var (
	issues       []Issue
	analysisConf *AnalysisConfig
	toolboxPath  string = os.Getenv("TOOLBOX_PATH")
	codePath     string = os.Getenv("CODE_PATH")
)

func main() {
	var err error

	fmt.Println("CODE_PATH = ", os.Getenv("CODE_PATH"))
	fmt.Println("TOOLBOX_PATH = ", os.Getenv("TOOLBOX_PATH"))

	fmt.Println("Parsing analysis_config.json...")
	if analysisConf, err = readAnalysisConfig(); err != nil {
		log.Fatalln(err)
	}

	fmt.Println("Resolving files and running analysis...")
	for _, path := range analysisConf.Files {
		content, err := ioutil.ReadFile(path)
		if err != nil {
			fmt.Printf("Failed to read file: %s. Error: %s", path, err)
			continue
		}
		lines := strings.Split(string(content), "\n")
		for lineNumber, line := range lines {
			if strings.Contains(line, "TODO") {
				createIssue(path, lineNumber, 0)
				createDummyIssue(path, lineNumber, 0)
			}
		}
	}
	fmt.Println("Preparing analysis result...")
	analysisResult := prepareResult()

	fmt.Println("Writing the result to", path.Join(toolboxPath, "analysis_results.json"))
	if writeError := writeMacroResult(analysisResult); writeError != nil {
		log.Fatalln("Error occured while writing results:", writeError)
	}
}
