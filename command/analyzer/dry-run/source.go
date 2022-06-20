package dry_run

import (
	"bytes"
	"fmt"
	"path/filepath"
	"time"

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
	buf := bytes.NewBuffer(nil)
	a.RemoteSource = true

	a.Spinner.SetSuffix(fmt.Sprintf("Creating temporary directory to clone %s", a.SourcePath))
	time.Sleep(5 * time.Second)
	if a.TempCloneDirectory, err = createTemporaryDirectory("code"); err != nil {
		return "", err
	}

	// Clone the repository to a temporary directory
	a.Spinner.SetSuffix(fmt.Sprintf("Cloning %s to %s", a.SourcePath, a.TempCloneDirectory))
	if _, err := git.PlainClone(a.TempCloneDirectory, false, &git.CloneOptions{
		URL:      a.SourcePath,
		Depth:    1,
		Progress: buf,
	}); err != nil {
		return "", err
	}
	return a.TempCloneDirectory, nil
}
