package run

import (
	"net/url"
	"os"
	"path"
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

// Creates a temporary directory with the name supplied as the parameter
func createTemporaryDirectory(directoryName string) (string, error) {
	return os.MkdirTemp("", directoryName)
}

func fetchEnvironmentVariables() {
	/* Check if the user supplied CODE_PATH and TOOLBOX_PATH, if not
	 * use the default values of CODE_PATH and TOOLBOX_PATH */
	if _, envVarPresent := os.LookupEnv("CODE_PATH"); envVarPresent {
		containerCodePath = os.Getenv("CODE_PATH")
	}
	if _, envVarPresent := os.LookupEnv("TOOLBOX_PATH"); envVarPresent {
		containerToolBoxPath = os.Getenv("CODE_PATH")
	}
}
