package transformers

type TransformersQueryResponse struct {
	Transformers struct {
		Edges []struct {
			Node struct {
				Name      string `json:"name"`
				Shortcode string `json:"shortcode"`
			} `json:"node"`
		} `json:"edges"`
	} `json:"transformers"`
}
