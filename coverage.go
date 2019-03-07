package main

import "io/ioutil"

// getCoverageFileContents accepts a directory, checks for coverage.xml file
// and returns contents as the string / error
func getCoverageFileContents(workspaceDir string) (string, error) {
	coverageFile := ""

	// Read coverage file
	coverageBytes, err := ioutil.ReadFile(workspaceDir + "/coverage.xml")
	if err != nil {
		return coverageFile, err
	}
	coverageFile = string(coverageBytes)

	return coverageFile, nil
}
