package pagination

// DefaultPageSize is the page size used for top-level pagination loops.
const DefaultPageSize = 100

// NestedPageSize is the fetch size for nested connection fields (e.g. issues
// per check in a run) where cursor-based pagination is not practical.
const NestedPageSize = 500

// MaxResults is the hard cap on total results fetched across all pages.
const MaxResults = 500

// PageInfo holds Relay-style cursor pagination state.
type PageInfo struct {
	HasNextPage bool    `json:"hasNextPage"`
	EndCursor   *string `json:"endCursor"`
}
