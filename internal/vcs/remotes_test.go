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

func TestDetectProvider(t *testing.T) {
	tests := []struct {
		url  string
		want string
	}{
		{"git@github.com:user/repo.git", "GITHUB"},
		{"https://github.com/user/repo", "GITHUB"},
		{"git@gitlab.com:user/repo.git", "GITLAB"},
		{"https://gitlab.com/user/repo", "GITLAB"},
		{"git@bitbucket.org:user/repo.git", "BITBUCKET"},
		{"https://bitbucket.org/user/repo", "BITBUCKET"},
		{"https://dev.azure.com/org/proj/_git/repo", "ADS"},
		{"https://org.visualstudio.com/proj/_git/repo", "ADS"},
		{"git@ssh.dev.azure.com:v3/org/proj/repo", "ADS"},
		{"https://example.com/user/repo", ""},
		{"git@selfhosted.example.com:user/repo.git", ""},
	}
	for _, tt := range tests {
		t.Run(tt.url, func(t *testing.T) {
			got := detectProvider(tt.url)
			if got != tt.want {
				t.Errorf("detectProvider(%q) = %q, want %q", tt.url, got, tt.want)
			}
		})
	}
}

func TestExtractRepoName(t *testing.T) {
	tests := []struct {
		url  string
		want string
	}{
		{"git@github.com:user/myrepo.git", "myrepo"},
		{"https://github.com/user/myrepo", "myrepo"},
		{"https://github.com/user/myrepo.git", "myrepo"},
		{"https://dev.azure.com/org/proj/_git/myrepo", "myrepo"},
		{"git@ssh.dev.azure.com:v3/org/proj/myrepo", "myrepo"},
	}
	for _, tt := range tests {
		t.Run(tt.url, func(t *testing.T) {
			got := extractRepoName(tt.url)
			if got != tt.want {
				t.Errorf("extractRepoName(%q) = %q, want %q", tt.url, got, tt.want)
			}
		})
	}
}

func TestExtractOwner(t *testing.T) {
	tests := []struct {
		url      string
		provider string
		want     string
	}{
		// SSH GitHub
		{"git@github.com:myowner/repo.git", "GITHUB", "myowner"},
		// HTTPS GitHub
		{"https://github.com/myowner/repo", "GITHUB", "myowner"},
		// HTTPS with PAT
		{"https://user:token@github.com/myowner/repo", "GITHUB", "myowner"},
		// SSH GitLab
		{"git@gitlab.com:myowner/repo.git", "GITLAB", "myowner"},
		// HTTPS GitLab
		{"https://gitlab.com/myowner/repo", "GITLAB", "myowner"},
		// ADS delegation
		{"https://dev.azure.com/myorg/proj/_git/repo", "ADS", "myorg"},
		// Unknown prefix
		{"ftp://example.com/owner/repo", "GITHUB", ""},
	}
	for _, tt := range tests {
		t.Run(tt.url, func(t *testing.T) {
			got := extractOwner(tt.url, tt.provider)
			if got != tt.want {
				t.Errorf("extractOwner(%q, %q) = %q, want %q", tt.url, tt.provider, got, tt.want)
			}
		})
	}
}

func TestExtractADSOwner(t *testing.T) {
	tests := []struct {
		name string
		url  string
		want string
	}{
		{"HTTPS dev.azure.com", "https://dev.azure.com/myorg/proj/_git/repo", "myorg"},
		{"HTTPS visualstudio.com", "https://myorg.visualstudio.com/proj/_git/repo", "myorg"},
		{"SSH dev.azure.com", "git@ssh.dev.azure.com:v3/myorg/proj/repo", "myorg"},
		{"SSH visualstudio.com", "myorg@vs-ssh.visualstudio.com:v3/myorg/proj/repo", "myorg"},
		{"HTTPS dev.azure.com empty path", "https://dev.azure.com/", ""},
		{"HTTPS invalid URL", "https://://bad", ""},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := extractADSOwner(tt.url)
			if got != tt.want {
				t.Errorf("extractADSOwner(%q) = %q, want %q", tt.url, got, tt.want)
			}
		})
	}
}

// TestGetRemoteMap_EmptyInput verifies that an empty remote list returns an empty map.
// Note: the ListRemotes() code path (auto-detecting remotes from git) requires an
// integration test environment with a real git process, so it is not covered here.
// If the map is empty, the caller (ResolveRemote) is responsible for returning an error.
func TestGetRemoteMap_EmptyInput(t *testing.T) {
	got, err := getRemoteMap([]string{})
	if err != nil {
		t.Fatalf("unexpected error for empty input: %v", err)
	}
	if len(got) != 0 {
		t.Errorf("expected empty map, got %d entries: %v", len(got), got)
	}
}

func TestExtractADSOwner_SSHNoColon(t *testing.T) {
	// SSH URL without a colon separator → fallthrough return ""
	got := extractADSOwner("git@ssh.dev.azure.com")
	if got != "" {
		t.Errorf("extractADSOwner(no colon) = %q, want empty", got)
	}
}

func TestExtractADSOwner_SSHShortPath(t *testing.T) {
	// SSH URL with colon but only one path segment → return ""
	got := extractADSOwner("git@ssh.dev.azure.com:v3")
	if got != "" {
		t.Errorf("extractADSOwner(short path) = %q, want empty", got)
	}
}

func TestExtractADSOwner_HTTPSVisualStudioEmptyHost(t *testing.T) {
	got := extractADSOwner("https://visualstudio.com/proj/_git/repo")
	if got != "visualstudio" {
		t.Errorf("extractADSOwner(visualstudio no subdomain) = %q, want %q", got, "visualstudio")
	}
}

func TestExtractOwner_SSHParseError(t *testing.T) {
	// git@ prefix with a path that url.Parse can handle, but returns no owner
	got := extractOwner("git@github.com:", "GITHUB")
	// After splitting on ":", the second element is "" which url.Parse accepts
	// The path will be empty, resulting in an index-out-of-bounds or empty return
	// Just ensure no panic
	_ = got
}

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
		{
			"GitLab HTTPS URLs",
			[]string{
				"origin	https://gitlab.com/myuser/myrepo (fetch)",
				"origin	https://gitlab.com/myuser/myrepo (push)",
			},
			map[string][]string{
				"origin": {"myuser", "myrepo", "GITLAB", "myuser/myrepo"},
			},
		},
		{
			"Bitbucket SSH URLs",
			[]string{
				"origin	git@bitbucket.org:myuser/myrepo.git (fetch)",
				"origin	git@bitbucket.org:myuser/myrepo.git (push)",
			},
			map[string][]string{
				"origin": {"myuser", "myrepo", "BITBUCKET", "myuser/myrepo"},
			},
		},
		{
			"unsupported provider is skipped",
			[]string{
				"origin	https://selfhosted.example.com/user/repo (fetch)",
				"origin	https://selfhosted.example.com/user/repo (push)",
			},
			map[string][]string{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			remoteMap, err := getRemoteMap(tt.remotes)
			if err != nil {
				t.Error(err)
				return
			}

			if len(remoteMap) != len(tt.want) {
				t.Errorf("got %d remotes, want %d", len(remoteMap), len(tt.want))
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
