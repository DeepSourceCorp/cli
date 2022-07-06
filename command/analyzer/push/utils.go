package push

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	analyzerConfig "github.com/deepsourcelabs/cli/analyzers/config"
	"github.com/deepsourcelabs/cli/types"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
)

// getAnalyzerVersion fetches the latest git tag version of the Analyzer.
func getAnalyzerVersion(analyzerDir string) (string, error) {
	analyzerDir, _ = filepath.Abs(analyzerDir)

	// Open the Analyzer's git directory.
	repo, err := git.PlainOpenWithOptions(analyzerDir, &git.PlainOpenOptions{
		DetectDotGit: true,
	})
	if err != nil {
		return "", err
	}

	// Fetch the repo tags list.
	tagReferences, _ := repo.Tags()
	currentTagRef := []string{}
	if err = tagReferences.ForEach(func(t *plumbing.Reference) error {
		currentTagRef = append(currentTagRef, t.Name().String())
		return nil
	}); err != nil {
		return "", err
	}

	if len(currentTagRef) != 0 {
		// Convert refs/tags/v0.2.1 -> v0.2.1
		return strings.TrimPrefix(currentTagRef[len(currentTagRef)-1], "refs/tags/"), nil
	}

	// currentTagRef slice is empty if there are not tags in the Analyzer git directory.
	headRef, err := repo.Head()
	if err != nil {
		return "", fmt.Errorf("couldn't find the latest git tag or commit")
	}
	return headRef.Hash().String()[:7], nil
}

// getImageRegistryURL fetches the registry URL to which the image has to be pushed.
func getImageRegistryURL() string {
	if envRegistryURL, envConfigured := os.LookupEnv("REGISTRY_URL"); envConfigured {
		return envRegistryURL
	}
	return defaultRegistryURL
}

// getAnalyzerData fetches the data required to build and push the image:
//  - The analyzer.toml data which contains the Analyzer shortcode which would be the image name.
//  - The latest git tag or the git commit if the tag doesn't exist which will be used to tag the image.
func getAnalyzerData() (types.AnalyzerTOML, string, error) {
	cwd, err := os.Getwd()
	if err != nil {
		return types.AnalyzerTOML{}, "", err
	}

	analyzerTOML, err := analyzerConfig.GetAnalyzerTOML()
	if err != nil {
		return types.AnalyzerTOML{}, "", err
	}

	analyzerVersion, err := getAnalyzerVersion(cwd)
	if err != nil {
		return types.AnalyzerTOML{}, "", err
	}
	return *analyzerTOML, analyzerVersion, nil
}
