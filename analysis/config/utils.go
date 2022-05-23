package config

import (
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/gobwas/glob"
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
			if !fileInfo.IsDir() && !strings.HasPrefix(path, filepath.Join(codePath, ".git")) && fileCount != 1 {
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
			g := glob.MustCompile(path.Join(r.LocalCodePath, patterns[i]))
			if g.Match(file) {
				matchedFiles = append(matchedFiles, file)
			}
		}
	}
	return matchedFiles, nil
}

// Filters the analysis files and removes the files matching the exclude_patterns from them
// TODO: Improve the logic here
func (r *AnalysisRun) filterAnalysisFiles() {
	excluded := false
	filteredFiles := []string{}
	for _, file := range r.AnalysisFiles {
		excluded = false
		for _, excludedFile := range r.ExcludedFiles {
			if file == excludedFile {
				excluded = true
				break
			}
		}
		if !excluded {
			filteredFiles = append(filteredFiles, file)
		}
	}
	r.AnalysisFiles = filteredFiles
}

// Modify the filepaths to use the container CODE_PATH and not the local CODE_PATH
// since the file will be mounted on the container and there, the container's path would
// only be resolvable
func (r *AnalysisRun) modifyFilePaths() {
	for idx, file := range r.AnalysisFiles {
		filePath := strings.TrimPrefix(file, r.LocalCodePath)
		r.AnalysisFiles[idx] = path.Join(r.ContainerCodePath, filePath)
	}
}
