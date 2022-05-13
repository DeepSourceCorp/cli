package run

import (
	"log"
	"net/url"
	"os"
	"path/filepath"
	"strings"
)

// isValidUrl tests a string to determine if it is a well-structured url or not.
func isValidUrl(toTest string) bool {
	_, err := url.ParseRequestURI(toTest)
	if err != nil {
		return false
	}

	u, err := url.Parse(toTest)
	if err != nil || u.Scheme == "" || u.Host == "" {
		return false
	}

	return true
}

// Returns the files to be analyzed
func getFilesToAnalyze(codePath string) ([]string, error) {
	fileCount := 0
	allFiles := make([]string, 0)
	err := filepath.Walk(codePath,
		func(path string, _ os.FileInfo, err error) error {
			if err != nil {
				log.Println(err)
				return err
			}
			fileCount++

			if !strings.HasPrefix(path, filepath.Join(codePath, ".git")) &&
				fileCount != 1 {
				allFiles = append(allFiles, path)
			}
			return nil
		})
	if err != nil {
		return allFiles, err
	}
	return allFiles, nil
}
