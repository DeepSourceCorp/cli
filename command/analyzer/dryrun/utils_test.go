package dryrun

import (
	"testing"
)

func TestParseImageName(t *testing.T) {
	type fields struct {
		DockerImageName string
	}
	tests := []struct {
		name          string
		fields        fields
		wantImageName string
		wantImageTag  string
	}{
		{
			name: "latest tagged docker image",
			fields: fields{
				DockerImageName: "deepsourcelabs/analyzer:latest",
			},
			wantImageName: "deepsourcelabs/analyzer",
			wantImageTag:  "latest",
		},
		{
			name: "version tagged image",
			fields: fields{
				DockerImageName: "deepsourcelabs/analyzer-two:v1.1.1",
			},
			wantImageName: "deepsourcelabs/analyzer-two",
			wantImageTag:  "v1.1.1",
		},
		{
			name: "image with no tag",
			fields: fields{
				DockerImageName: "deepsourcelabs/analyzer-three",
			},
			wantImageName: "deepsourcelabs/analyzer-three",
			wantImageTag:  "latest",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			a := &AnalyzerDryRun{
				DockerImageName: tt.fields.DockerImageName,
			}
			imgName, imgTag := a.parseImageName()
			if imgName != tt.wantImageName {
				t.Errorf("AnalyzerDryRun.parseImageName() got = %v, want %v", imgName, tt.wantImageName)
			}
			if imgTag != tt.wantImageTag {
				t.Errorf("AnalyzerDryRun.parseImageName() got1 = %v, want %v", imgTag, tt.wantImageTag)
			}
		})
	}
}
