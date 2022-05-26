package run

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/go-git/go-git/v5"
)

/* Resolves the code to be analyzed by the Analyzer.
 * The user passes it as an argument to the command `deepsource analyzer run <directory/repository URL>`
 * Parse the argument and check if its a URL, if not then resolve the local directory path */
func (a *AnalyzerDryRun) resolveAnalysisCodePath() (string, error) {
	// Check if the source path is a valid VCS URL
	if isValidUrl(a.SourcePath) {
		tempCloneDir, err := a.cloneRemoteSource()
		if err != nil {
			return "", err
		}
		a.SourcePath = tempCloneDir
	} else {
		a.SourcePath, _ = filepath.Abs(a.SourcePath)
	}
	return a.SourcePath, nil
}

// Clones the remote repository which is to be analyzed
func (a *AnalyzerDryRun) cloneRemoteSource() (string, error) {
	var err error
	a.RemoteSource = true
	if a.TempCloneDirectory, err = createTemporaryDirectory("code"); err != nil {
		return "", err
	}

	// Clone the repository to a temporary directory
	fmt.Printf("Cloning %s to %s\n", a.SourcePath, a.TempCloneDirectory)
	if _, err := git.PlainClone(a.TempCloneDirectory, false, &git.CloneOptions{
		URL:      a.SourcePath,
		Depth:    1,
		Progress: os.Stdout,
	}); err != nil {
		return "", err
	}
	return a.TempCloneDirectory, nil
}
