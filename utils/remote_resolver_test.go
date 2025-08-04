package utils

import (
	"reflect"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestResolveRemote(t *testing.T) {
	tests := []struct {
		name    string
		repoArg string
		want    *RemoteData
		wantErr bool
	}{
		{
			name:    "valid github remote URL",
			repoArg: "github.com/deepsourcelabs/cli",
			want:    &RemoteData{Owner: "deepsourcelabs", RepoName: "cli", VCSProvider: "GITHUB"},
			wantErr: false,
		},
		{
			name:    "valid github remote URL (short form)",
			repoArg: "gh/deepsourcelabs/cli",
			want:    &RemoteData{Owner: "deepsourcelabs", RepoName: "cli", VCSProvider: "GITHUB"},
			wantErr: false,
		},
		{
			name:    "valid github enterprise remote URL (short form)",
			repoArg: "ghe/deepsourcelabs/cli",
			want:    &RemoteData{Owner: "deepsourcelabs", RepoName: "cli", VCSProvider: "GITHUB_ENTERPRISE"},
			wantErr: false,
		},
		{
			name:    "valid gitlab remote URL",
			repoArg: "gitlab.com/deepsourcelabs/cli",
			want:    &RemoteData{Owner: "deepsourcelabs", RepoName: "cli", VCSProvider: "GITLAB"},
			wantErr: false,
		},
		{
			name:    "valid gitlab remote URL (short form)",
			repoArg: "gl/deepsourcelabs/cli",
			want:    &RemoteData{Owner: "deepsourcelabs", RepoName: "cli", VCSProvider: "GITLAB"},
			wantErr: false,
		},
		{
			name:    "valid bitbucket remote URL",
			repoArg: "bitbucket.com/deepsourcelabs/cli",
			want:    &RemoteData{Owner: "deepsourcelabs", RepoName: "cli", VCSProvider: "BITBUCKET"},
			wantErr: false,
		},
		{
			name:    "valid bitbucket remote URL (short form)",
			repoArg: "bb/deepsourcelabs/cli",
			want:    &RemoteData{Owner: "deepsourcelabs", RepoName: "cli", VCSProvider: "BITBUCKET"},
			wantErr: false,
		},
		{
			name:    "valid bitbucket datacenter remote URL (short form)",
			repoArg: "bbdc/deepsourcelabs/cli",
			want:    &RemoteData{Owner: "deepsourcelabs", RepoName: "cli", VCSProvider: "BITBUCKET_DATACENTER"},
			wantErr: false,
		},
		{
			name:    "valid Azure Devops remote URL (short form)",
			repoArg: "ads/deepsourcelabs/cli",
			want:    &RemoteData{Owner: "deepsourcelabs", RepoName: "cli", VCSProvider: "ADS"},
			wantErr: false,
		},
		{
			name:    "invalid VCS provider",
			repoArg: "example.com/deepsourcelabs/cli",
			want:    nil,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := ResolveRemote(tt.repoArg)

			if tt.wantErr {
				assert.NotNil(t, err)
			} else {
				assert.Nil(t, err)
			}

			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("got: %v, want: %v\n", got, tt.want)
			}
		})
	}
}
