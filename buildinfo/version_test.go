package buildinfo

import (
	"reflect"
	"testing"
	"time"
)

func TestBuildInfo_String(t *testing.T) {
	date, _ := time.Parse("2006-01-02T15:04:05Z", "2021-01-21T10:30:00Z")

	tests := []struct {
		name      string
		version   string
		date      time.Time
		buildMode string
		want      string
	}{
		{
			"dev build with date shows build time",
			"1.5.0",
			date,
			"dev",
			"Version:    v1.5.0\nBuild Time: 2021-01-21T10:30:00Z",
		},
		{
			"prod build with date hides build time",
			"1.5.0",
			date,
			"prod",
			"Version:    v1.5.0",
		},
		{
			"version only",
			"1.5.0",
			time.Time{},
			"",
			"Version:    v1.5.0",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			bi := BuildInfo{
				Version:   tt.version,
				Date:      tt.date,
				BuildMode: tt.buildMode,
			}
			if got := bi.String(); got != tt.want {
				t.Errorf("BuildInfo.String() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestSetBuildInfo(t *testing.T) {
	date, _ := time.Parse("2006-01-02T15:04:05Z", "2021-01-21T10:30:00Z")

	want := &BuildInfo{
		Version:   "1.0.0",
		Date:      date,
		BuildMode: "dev",
	}

	tests := []struct {
		name      string
		version   string
		dateStr   string
		buildMode string
	}{
		{
			"must set the buildInfo package global",
			"1.0.0",
			"2021-01-21T10:30:00Z",
			"dev",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(_ *testing.T) {
			SetBuildInfo(tt.version, tt.dateStr, tt.buildMode)
		})
		if !reflect.DeepEqual(buildInfo, want) {
			t.Errorf("buildInfo = %v, want %v", buildInfo, want)
		}
	}
}
