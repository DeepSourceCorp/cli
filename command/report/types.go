package report

// ReportQueryInput is the schema for variables of artifacts
// report GraphQL query
type ReportQueryInput struct {
	AccessToken       string      `json:"accessToken"`
	CommitOID         string      `json:"commitOid"`
	ReporterName      string      `json:"reporter"`
	ReporterVersion   string      `json:"reporterVersion"`
	Key               string      `json:"key"`
	Data              string      `json:"data"`
	AnalyzerShortcode string      `json:"analyzer"`
	Compressed        string      `json:"compressed"`
	Metadata          interface{} `json:"metadata,omitempty"`
}

// ReportQueryInput is the structure of artifacts report
// GraphQL query
type ReportQuery struct {
	Query     string `json:"query"`
	Variables struct {
		Input ReportQueryInput `json:"input"`
	} `json:"variables"`
}

// QueryResponse is the response returned by artifacts report
// GraphQL query
type QueryResponse struct {
	Data struct {
		CreateArtifact struct {
			Error   string `json:"error"`
			Message string `json:"message"`
			Ok      bool   `json:"ok"`
		} `json:"createArtifact"`
	} `json:"data"`
}
