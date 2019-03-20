package main

type ReportQueryInput struct {
	AccessToken       string      `json:"accessToken"`
	CommitOID         string      `json:"commitOid"`
	ReporterName      string      `json:"reporter"`
	ReporterVersion   string      `json:"reporterVersion"`
	Key               string      `json:"key"`
	Data              string      `json:"data"`
	AnalyzerShortcode string      `json:"analyzer"`
	Metadata          interface{} `json:"metadata,omitempty"`
}

type ReportQuery struct {
	Query     string `json:"query"`
	Variables struct {
		Input ReportQueryInput `json:"input"`
	} `json:"variables"`
}

type QueryResponse struct {
	Data struct {
		CreateArtifact struct {
			Error string `json:"error"`
			Ok    bool   `json:"ok"`
		} `json:"createArtifact"`
	} `json:"data"`
}
