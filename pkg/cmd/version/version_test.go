package version

import (
	"reflect"
	"testing"
)

func TestFormatVersionOutput(t *testing.T) {
	type test struct {
		version string
		date    string
		want    string
	}

	tests := []test{
		{version: "v0.2.3", date: "2020-02-01", want: "DeepSource CLI v0.2.3\nReleased on 2020-02-01\nhttps://github.com/deepsourcelabs/cli/releases/tag/v0.2.3"},
		{version: "v0.8.7-pre.4", date: "2020-02-01", want: "DeepSource CLI v0.8.7-pre.4\nReleased on 2020-02-01\nhttps://github.com/deepsourcelabs/cli/releases/tag/v0.8.7-pre.4"},
		{version: "v0.5.4-90-gdd3f0e0", date: "2020-02-01", want: "DeepSource CLI v0.5.4-90-gdd3f0e0\nReleased on 2020-02-01\nhttps://github.com/deepsourcelabs/cli/releases/tag/v0.5.4-90-gdd3f0e0"},
		{version: "dogecoin", date: "2020-02-01", want: "DeepSource CLI dogecoin\nReleased on 2020-02-01\nhttps://github.com/deepsourcelabs/cli/releases/tag/dogecoin"},
	}
	for _, tc := range tests {
		got := formatVersionOutput(tc.version, tc.date)
		if !reflect.DeepEqual(tc.want, got) {
			t.Fatalf("expected: %v, got: %v", tc.want, got)
		}
	}

}
