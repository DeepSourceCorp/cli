package config

import (
	"log"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/bmatcuk/doublestar/v4"
)

/* Walks the `CODE_PATH` directory and returns all the files other than the ones present
 * in the .git folder for analysis in the form of a string array */
func readAllFiles(codePath string) ([]string, error) {
	fileCount := 0

	allFiles := make([]string, 0)

	err := filepath.Walk(codePath,
		func(path string, fileInfo os.FileInfo, err error) error {
			if err != nil {
				return err
			}
			fileCount++

			/* Check the following before appending to the list of files:
			 * - Should not be a directory
			 * - The walked file should not be present in .git folder
			 * TODO: Check why fileCount != 1 condition is used here */
			if !fileInfo.IsDir() || !strings.HasPrefix(path, filepath.Join(codePath, ".git")) && fileCount != 1 {
				allFiles = append(allFiles, path)
			}
			return nil
		})
	if err != nil {
		return allFiles, err
	}
	return allFiles, nil
}

// Returns the slice of files matching certain glob patterns
func (r *AnalysisRun) getMatchingFiles(patterns []string) ([]string, error) {
	matchedFiles := make([]string, 0)

	// Return all the files if no exclude_patterns are configured
	if len(patterns) == 0 {
		return matchedFiles, nil
	}

	for _, file := range r.AnalysisFiles {
		for i := range patterns {
			match, err := doublestar.Match(path.Join(r.CodePath, patterns[i]), file)
			if err != nil {
				log.Printf("Failed to match the file %s with pattern %s\n", file, patterns[i])
			}
			if match {
				matchedFiles = append(matchedFiles, file)
				break
			}
		}
	}
	return matchedFiles, nil
}

// Filters the analysis files and removes the files matching the exclude_patterns from them
// TODO: Improve the logic here
func (r *AnalysisRun) filterAnalysisFiles() {
	filteredFiles := []string{}
	for _, file := range r.AnalysisFiles {
		for _, excludedFile := range r.ExcludedFiles {
			if file == excludedFile {
				break
			}
			filteredFiles = append(filteredFiles, file)
		}
	}
	r.AnalysisFiles = filteredFiles
}
