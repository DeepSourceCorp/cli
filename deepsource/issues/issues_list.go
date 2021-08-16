package issues

type Position struct {
	BeginLine int // The line where the code covered under the issue starts
	EndLine   int // The line where the code covered under the issue starts
}

type Location struct {
	Path     string   // The filepath where the issue is reported
	Position Position // The position info where the issue is raised
}

type AnalyzerMeta struct {
	Shortcode string // Analyzer shortcode
}

type Issue struct {
	IssueText string       // The describing heading of the issue
	IssueCode string       // DeepSource code for the issue reported
	Location  Location     // The location data for the issue reported
	Analyzer  AnalyzerMeta // The Analyzer which raised the issue
}
