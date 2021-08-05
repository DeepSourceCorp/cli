package issues

type Position struct {
	BeginLine int
	EndLine   int
}

type Location struct {
	Path     string
	Position Position
}

type AnalyzerMeta struct {
	Shortcode string
}

type Issue struct {
	IssueText string
	IssueCode string
	Location  Location
	Analyzer  AnalyzerMeta
}
