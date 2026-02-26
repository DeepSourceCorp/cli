package analyzers

type Analyzer struct {
	Name       string `json:"name"`
	Shortcode  string `json:"shortcode"`
	MetaSchema string `json:"meta_schema,omitempty"`
}
