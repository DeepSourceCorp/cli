package run

import (
	"log"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"strings"

	analysis "github.com/deepsourcelabs/cli/analysis/config"
	"github.com/deepsourcelabs/cli/analysis/lsp"
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

// Modify the filepaths to use the container CODE_PATH and not the local CODE_PATH
// since the file will be mounted on the container and there, the container's path would
// only be resolvable
func modifyAnalysisConfigFilepaths(analysisConfig *analysis.AnalysisConfig, localCodePath, containerCodePath string) {
	for idx, file := range analysisConfig.Files {
		filePath := strings.TrimPrefix(string(file.URI), localCodePath)
		analysisConfig.Files[idx].URI = lsp.DocumentURI(path.Join(containerCodePath, filePath))
	}

	for idx, file := range analysisConfig.TestFiles {
		filePath := strings.TrimPrefix(string(file.URI), localCodePath)
		analysisConfig.TestFiles[idx].URI = lsp.DocumentURI(path.Join(containerCodePath, filePath))
	}

	for idx, file := range analysisConfig.ExcludedFiles {
		filePath := strings.TrimPrefix(string(file.URI), localCodePath)
		analysisConfig.ExcludedFiles[idx].URI = lsp.DocumentURI(path.Join(containerCodePath, filePath))
	}
}
