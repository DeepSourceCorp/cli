package main

type CoverageInput struct {
	AccessToken string `json:"accessToken"`
	CommitOID   string `json:"commitOid"`
	Format      string `json:"format"`
	Data        string `json:"data"`
}

type Query struct {
	Query     string `json:"query"`
	Variables struct {
		Input CoverageInput `json:"input"`
	} `json:"variables"`
}
