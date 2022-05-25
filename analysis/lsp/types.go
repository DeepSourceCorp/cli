package lsp

//////////////////////////////
// Document identity types  //
/////////////////////////////

type DocumentURI string

type TextDocumentItem struct {
	URI        DocumentURI `json:"uri"`
	LanguageID string      `json:"languageID,omitempty"`
	Version    int         `json:"version,omitempty"`
	Text       string      `json:"text,omitempty"`
}

///////////////////////////////
// Diagnostic related types //
/////////////////////////////

type DiagnosticSeverity int

const (
	Error       DiagnosticSeverity = 1
	Warning     DiagnosticSeverity = 2
	Information DiagnosticSeverity = 3
	Hint        DiagnosticSeverity = 4
)

type Position struct {
	Line      int `json:"line"`
	Character int `json:"character"`
}
type Range struct {
	Start Position `json:"start"`
	End   Position `json:"end"`
}

type Location struct {
	URI   string `json:"uri"`
	Range Range  `json:"range"`
}

type DiagnosticRelatedInformation struct {
	Location Location `json:"location"`
	Message  string   `json:"message"`
}

type Diagnostic struct {
	Range    Range              `json:"range"`
	Severity DiagnosticSeverity `json:"severity,omitempty"`
	Code     string             `json:"code,omitempty"`
	Source   string             `json:"source,omitempty"`
	Message  string             `json:"message"`

	/**
	 * An array of related diagnostic information, e.g. when symbol-names within
	 * a scope collide all definitions can be marked via this property.
	 * var a,b
	 * a := 2
	 * Issues in line 1 and 2 are related.
	 */
	RelatedInformation []DiagnosticRelatedInformation `json:"relatedInformation"`
}
