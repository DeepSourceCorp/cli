package version

import (
	"reflect"
	"testing"
	"time"
)

func TestBuildInfo_String(t *testing.T) {

	date, _ := time.Parse("2006-01-02", "2021-01-21")

	type fields struct {
		Version      string
		Date         time.Time
		GitTreeState string
		GitCommit    string
	}
	tests := []struct {
		name   string
		fields fields
		want   string
	}{
		{
			"must return the correct version string when date and version is available",
			fields{
				Version: "1.5.0",
				Date:    date,
			},
			"DeepSource CLI version 1.5.0 (2021-01-21)",
		},
		{
			"must return the correct version string when only version is available",
			fields{
				Version: "1.5.0",
			},
			"DeepSource CLI version 1.5.0",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			bi := BuildInfo{
				Version:      tt.fields.Version,
				Date:         tt.fields.Date,
				GitTreeState: tt.fields.GitTreeState,
				GitCommit:    tt.fields.GitCommit,
			}
			if got := bi.String(); got != tt.want {
				t.Errorf("BuildInfo.String() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestSetBuildInfo(t *testing.T) {
	date, _ := time.Parse("2006-01-02", "2021-01-21")

	want := &BuildInfo{
		Version: "1.0.0",
		Date:    date,
	}

	type args struct {
		version      string
		dateStr      string
		gitTreeState string
		gitCommit    string
	}
	tests := []struct {
		name string
		args args
	}{
		{
			"must set the buildInfo package global",
			args{version: "1.0.0", dateStr: "2021-01-21"},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			SetBuildInfo(tt.args.version, tt.args.dateStr, tt.args.gitTreeState, tt.args.gitCommit)

		})
		if !reflect.DeepEqual(buildInfo, want) {
			t.Errorf("buildInfo = %v, want %v", buildInfo, want)
		}
	}
}
