package completion

import (
	"fmt"
	"sort"

	"github.com/deepsourcelabs/cli/internal/vcs"
)

// RepoCompletionCandidates returns repo args derived from git remotes for shell completion.
func RepoCompletionCandidates() []string {
	remotes, err := vcs.ListRemotes()
	if err != nil {
		return nil
	}

	candidates := make([]string, 0, len(remotes))
	for remoteName, data := range remotes {
		if len(data) < 3 {
			continue
		}
		shortcode, label := repoProviderInfo(data[2])
		if shortcode == "" {
			continue
		}
		candidate := fmt.Sprintf("%s/%s/%s\t%s (%s)", shortcode, data[0], data[1], remoteName, label)
		candidates = append(candidates, candidate)
	}

	sort.Strings(candidates)
	return candidates
}

func repoProviderInfo(provider string) (string, string) {
	switch provider {
	case "GITHUB":
		return "gh", "github"
	case "GITHUB_ENTERPRISE":
		return "ghe", "github enterprise"
	case "GITLAB":
		return "gl", "gitlab"
	case "BITBUCKET":
		return "bb", "bitbucket"
	case "BITBUCKET_DATACENTER":
		return "bbdc", "bitbucket datacenter"
	case "ADS":
		return "ads", "ads"
	default:
		return "", ""
	}
}
