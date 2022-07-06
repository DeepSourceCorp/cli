package analyzers

type SyncResponse struct {
	SyncAnalyzer `json:"syncAnalyzer"`
}

type SyncAnalyzer struct {
	Ok       bool     `json:"ok"`
	Warnings []string `json:"warnings"`
}
