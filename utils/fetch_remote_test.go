package utils

import (
	"reflect"
	"testing"
)

// Test data for PAT-based remote URLs
var remotesPATMap = map[string][]string{
	"origin": {"username", "repo", "GITHUB", "username/repo"},
}
var remotesPATList = []string{"origin	https://username:ghp_pat@github.com/username/repo (fetch)", "origin	https://username:ghp_pat@github.com/username/repo (push)"}

// Test data for multiple remotes
var multiRemoteMap = map[string][]string{
	"origin":   {"username", "repo", "GITHUB", "username/repo"},
	"upstream": {"company", "repo", "GITHUB", "company/repo"},
}
var multiRemoteList = []string{"origin	https://username:ghp_pat@github.com/username/repo (fetch)", "origin	https://username:ghp_pat@github.com/username/repo (push)", "upstream	https://username:ghp_pat@github.com/company/repo (fetch)", "upstream	https://username:ghp_pat@github.com/company/repo (push)"}

// Test data for SSH URLs
var sshRemoteMap = map[string][]string{
	"origin":   {"username", "repo", "GITHUB", "username/repo"},
	"upstream": {"company", "repo", "GITHUB", "company/repo"},
}
var sshRemoteList = []string{"origin	git@github.com:username/repo.git (fetch)", "origin	git@github.com:username/repo.git (push)", "upstream	git@github.com:company/repo.git (fetch)", "upstream	git@github.com:company/repo.git (push)"}

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
			"multiple remote URLs",
			multiRemoteList,
			multiRemoteMap,
		},
		{
			"SSH URLs",
			sshRemoteList,
			sshRemoteMap,
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
