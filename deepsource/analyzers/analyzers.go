package analyzers

type AnalyzersQueryResponse struct {
	Analyzers struct {
		Edges []struct {
			Node struct {
				Name       string `json:"name"`
				Shortcode  string `json:"shortcode"`
				MetaSchema string `json:"metaSchema"`
			} `json:"node"`
		} `json:"edges"`
	} `json:"analyzers"`
}
