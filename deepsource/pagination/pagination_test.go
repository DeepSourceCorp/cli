package pagination

import (
	"encoding/json"
	"testing"
)

func TestConstants(t *testing.T) {
	if DefaultPageSize != 100 {
		t.Errorf("DefaultPageSize = %d, want 100", DefaultPageSize)
	}
	if NestedPageSize != 500 {
		t.Errorf("NestedPageSize = %d, want 500", NestedPageSize)
	}
	if MaxResults != 1000 {
		t.Errorf("MaxResults = %d, want 1000", MaxResults)
	}
}

func TestPageInfo_JSONRoundTrip(t *testing.T) {
	cursor := "abc123"
	original := PageInfo{HasNextPage: true, EndCursor: &cursor}

	data, err := json.Marshal(original)
	if err != nil {
		t.Fatalf("Marshal: %v", err)
	}

	var decoded PageInfo
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("Unmarshal: %v", err)
	}

	if decoded.HasNextPage != original.HasNextPage {
		t.Errorf("HasNextPage = %v, want %v", decoded.HasNextPage, original.HasNextPage)
	}
	if decoded.EndCursor == nil || *decoded.EndCursor != cursor {
		t.Errorf("EndCursor = %v, want %q", decoded.EndCursor, cursor)
	}
}

func TestPageInfo_NilCursor(t *testing.T) {
	original := PageInfo{HasNextPage: false, EndCursor: nil}

	data, err := json.Marshal(original)
	if err != nil {
		t.Fatalf("Marshal: %v", err)
	}

	var decoded PageInfo
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("Unmarshal: %v", err)
	}

	if decoded.HasNextPage != false {
		t.Error("HasNextPage should be false")
	}
	if decoded.EndCursor != nil {
		t.Errorf("EndCursor should be nil, got %v", decoded.EndCursor)
	}
}
