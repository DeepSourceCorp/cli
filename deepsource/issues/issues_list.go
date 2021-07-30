package issues

type IssuesListResponse struct {
	Repository struct {
		Issues struct {
			Edges []struct {
				Node struct {
					Path          string `json:"path"`
					Beginline     int    `json:"beginLine"`
					Endline       int    `json:"endLine"`
					Concreteissue struct {
						Analyzer struct {
							Shortcode string `json:"shortcode"`
						} `json:"analyzer"`
						Title     string `json:"title"`
						Shortcode string `json:"shortcode"`
					} `json:"concreteIssue"`
				} `json:"node"`
			} `json:"edges"`
		} `json:"issues"`
	} `json:"repository"`
}

type IssuesListFileResponse struct {
	Repository struct {
		File struct {
			Issues struct {
				Edges []struct {
					Node struct {
						Path          string `json:"path"`
						Beginline     int    `json:"beginLine"`
						Endline       int    `json:"endLine"`
						Concreteissue struct {
							Analyzer struct {
								Shortcode string `json:"shortcode"`
							} `json:"analyzer"`
							Title     string `json:"title"`
							Shortcode string `json:"shortcode"`
						} `json:"concreteIssue"`
					} `json:"node"`
				} `json:"edges"`
			} `json:"issues"`
		} `json:"file"`
	} `json:"repository"`
}
