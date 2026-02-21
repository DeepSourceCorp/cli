package vcs

import (
	"reflect"
	"testing"
)

// Test data for PAT-based remote URLs
var remotesPATMap = map[string][]string{
	"origin": {"username", "repo", "GITHUB", "username/repo"},
}
var remotesPATList = []string{"origin	https://username:ghp_pat@github.com/username/repo (fetch)", "origin	https://username:ghp_pat@github.com/username/repo (push)"}

// Test data for multiple remotes with PATs
var multiRemotePATMap = map[string][]string{
	"origin":   {"username", "repo", "GITHUB", "username/repo"},
	"upstream": {"company", "repo", "GITHUB", "company/repo"},
}
var multiRemotePATList = []string{"origin	https://username:ghp_pat@github.com/username/repo (fetch)", "origin	https://username:ghp_pat@github.com/username/repo (push)", "upstream	https://username:ghp_pat@github.com/company/repo (fetch)", "upstream	https://username:ghp_pat@github.com/company/repo (push)"}

// Test data for multiple remotes
var multiRemoteMap = map[string][]string{
	"origin":   {"username", "repo", "GITHUB", "username/repo"},
	"upstream": {"company", "repo", "GITHUB", "company/repo"},
}
var multiRemoteList = []string{"origin	https://github.com/username/repo (fetch)", "origin	https://github.com/username/repo (push)", "upstream	https://github.com/company/repo (fetch)", "upstream	https://github.com/company/repo (push)"}

// Test data for SSH URLs
var sshRemoteMap = map[string][]string{
	"origin":   {"username", "repo", "GITHUB", "username/repo"},
	"upstream": {"company", "repo", "GITHUB", "company/repo"},
}
var sshRemoteList = []string{"origin	git@github.com:username/repo.git (fetch)", "origin	git@github.com:username/repo.git (push)", "upstream	git@github.com:company/repo.git (fetch)", "upstream	git@github.com:company/repo.git (push)"}

// Test data for Azure DevOps HTTPS URLs
var adsHTTPSRemoteMap = map[string][]string{
	"origin": {"myorg", "myrepo", "ADS", "myorg/myrepo"},
}
var adsHTTPSRemoteList = []string{"origin	https://dev.azure.com/myorg/myproject/_git/myrepo (fetch)", "origin	https://dev.azure.com/myorg/myproject/_git/myrepo (push)"}

// Test data for Azure DevOps SSH URLs
var adsSSHRemoteMap = map[string][]string{
	"origin": {"myorg", "myrepo", "ADS", "myorg/myrepo"},
}
var adsSSHRemoteList = []string{"origin	git@ssh.dev.azure.com:v3/myorg/myproject/myrepo (fetch)", "origin	git@ssh.dev.azure.com:v3/myorg/myproject/myrepo (push)"}

// Test data for legacy visualstudio.com HTTPS URLs
var adsLegacyHTTPSRemoteMap = map[string][]string{
	"origin": {"myorg", "myrepo", "ADS", "myorg/myrepo"},
}
var adsLegacyHTTPSRemoteList = []string{"origin	https://myorg.visualstudio.com/myproject/_git/myrepo (fetch)", "origin	https://myorg.visualstudio.com/myproject/_git/myrepo (push)"}

// Test data for legacy visualstudio.com SSH URLs
var adsLegacySSHRemoteMap = map[string][]string{
	"origin": {"myorg", "myrepo", "ADS", "myorg/myrepo"},
}
var adsLegacySSHRemoteList = []string{"origin	myorg@vs-ssh.visualstudio.com:v3/myorg/myproject/myrepo (fetch)", "origin	myorg@vs-ssh.visualstudio.com:v3/myorg/myproject/myrepo (push)"}

func TestGetRemoteMap(t *testing.T) {
	tests := []struct {
		name    string
		remotes []string
		want    map[string][]string
	}{
		{
			"remote URLs with PATs",
			remotesPATList,
			remotesPATMap,
		},
		{
			"multiple remote URLs with PATs",
			multiRemotePATList,
			multiRemotePATMap,
		},
		{
			"multiple remote URLs",
			multiRemoteList,
			multiRemoteMap,
		},
		{
			"SSH URLs",
			sshRemoteList,
			sshRemoteMap,
		},
		{
			"Azure DevOps HTTPS URLs",
			adsHTTPSRemoteList,
			adsHTTPSRemoteMap,
		},
		{
			"Azure DevOps SSH URLs",
			adsSSHRemoteList,
			adsSSHRemoteMap,
		},
		{
			"Azure DevOps legacy visualstudio.com HTTPS URLs",
			adsLegacyHTTPSRemoteList,
			adsLegacyHTTPSRemoteMap,
		},
		{
			"Azure DevOps legacy visualstudio.com SSH URLs",
			adsLegacySSHRemoteList,
			adsLegacySSHRemoteMap,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			remoteMap, err := getRemoteMap(tt.remotes)
			if err != nil {
				t.Error(err)
				return
			}

			for remote := range remoteMap {
				got := remoteMap[remote]
				want := tt.want[remote]

				if !reflect.DeepEqual(got, want) {
					t.Errorf("got: %s; want: %s\n", got, want)
				}
			}
		})
	}
}
